# PowerShell Socket-Based Web Server untuk Game Dongeng Interaktif
# Menjalankan server lokal secara mandiri dan mengizinkan koneksi dari perangkat mobile (HP/Tablet)
# tanpa membutuhkan hak akses Administrator.

Add-Type -AssemblyName System.Web

$port = 8000
$workspaceDir = $PSScriptRoot

# Mengambil IP lokal komputer untuk kemudahan koneksi mobile
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*" 
}).IPAddress | Select-Object -First 1

# Bind ke semua network interface (0.0.0.0) agar bisa diakses dari HP
$ipAddress = [System.Net.IPAddress]::Any
$listener = New-Object System.Net.Sockets.TcpListener($ipAddress, $port)

try {
    $listener.Start()
    Write-Host "=========================================================="
    Write-Host "Server web soket berhasil berjalan!"
    Write-Host "Akses dari PC ini: http://localhost:${port}/"
    if ($localIp) {
        Write-Host "Akses dari HP/Tablet Anda: http://${localIp}:${port}/"
    } else {
        Write-Host "Akses dari HP: Hubungkan HP ke Wi-Fi yang sama dengan PC ini,"
        Write-Host "lalu ketik http://[IP_LOKAL_PC]:${port}/ di browser HP Anda."
    }
    Write-Host "----------------------------------------------------------"
    Write-Host "Tekan CTRL+C di jendela ini untuk mematikan server."
    Write-Host "=========================================================="

    # Loop utama untuk mendengarkan request HTTP
    while ($true) {
        if (!$listener.Pending()) {
            Start-Sleep -Milliseconds 50  # Mencegah pemakaian CPU tinggi
            continue
        }

        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        # Baca baris pertama request (misal: "GET /index.html HTTP/1.1")
        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($requestLine)) {
            $client.Close()
            continue
        }

        # Parsing path file dari request HTTP
        $parts = $requestLine.Split(" ")
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $method = $parts[0]
        $urlPath = $parts[1]
        
        # Buang parameter query jika ada (?v=123)
        if ($urlPath.Contains("?")) {
            $urlPath = $urlPath.Substring(0, $urlPath.IndexOf("?"))
        }

        # Arahkan root / ke index.html
        if ($urlPath -eq "/") { 
            $urlPath = "/index.html" 
        }
        
        # Decode URL encoding (misal %20 menjadi spasi)
        $urlPath = [System.Web.HttpUtility]::UrlDecode($urlPath)
        if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = "/index.html" }

        # Konversi path URL ke path file lokal Windows
        $filePath = Join-Path $workspaceDir $urlPath.Replace("/", "\").TrimStart('\')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Tentukan tipe mime berdasarkan ekstensi file
            $contentType = "application/octet-stream"
            if ($filePath.EndsWith(".html")) { 
                $contentType = "text/html; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".css")) { 
                $contentType = "text/css; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".js")) { 
                $contentType = "application/javascript; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".png")) { 
                $contentType = "image/png" 
            }
            elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { 
                $contentType = "image/jpeg" 
            }
            elseif ($filePath.EndsWith(".svg")) { 
                $contentType = "image/svg+xml; charset=utf-8" 
            }
            
            # Kirim Header dan Konten File
            $header = "HTTP/1.1 200 OK`r`n" +
                      "Content-Type: $contentType`r`n" +
                      "Content-Length: $($bytes.Length)`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            # File tidak ditemukan (404)
            $msg = "File tidak ditemukan"
            $msgBytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $header = "HTTP/1.1 404 Not Found`r`n" +
                      "Content-Type: text/plain; charset=utf-8`r`n" +
                      "Content-Length: $($msgBytes.Length)`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($msgBytes, 0, $msgBytes.Length)
        }
        
        $client.Close()
    }
}
catch {
    Write-Host "Terjadi kesalahan pada server web soket: $_"
}
finally {
    $listener.Stop()
}
