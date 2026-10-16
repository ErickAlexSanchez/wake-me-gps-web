$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$platform = Join-Path $sdk 'platforms\android-36'
if (-not (Test-Path $platform)) {
    Write-Host "Falta el Android SDK (platforms\android-36) en $sdk"
    Write-Host "Instala Android Studio, o el command line tools, y vuelve a correr este script."
    exit 1
}

$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk

$jdk21 = $null
foreach ($candidate in @(
    (Join-Path $env:LOCALAPPDATA 'Java\jdk-21')
)) {
    if (Test-Path (Join-Path $candidate 'bin\java.exe')) { $jdk21 = $candidate; break }
}
if (-not $jdk21) {
    $found = Get-ChildItem 'C:\Program Files\Eclipse Adoptium','C:\Program Files\Java' -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $jdk21 = $found.FullName }
}
if (-not $jdk21) {
    Write-Host "Falta un JDK 21. Capacitor 8 compila con Java 21; Java 17 no alcanza."
    exit 1
}
$env:JAVA_HOME = $jdk21
$env:Path = "$(Join-Path $jdk21 'bin');$env:Path"
$sdkDir = $sdk.Replace('\', '\\')
"sdk.dir=$sdkDir" | Set-Content -Path (Join-Path $root 'android\local.properties') -Encoding ascii

$keystore = Join-Path $root 'android\release.keystore'
$props = Join-Path $root 'android\keystore.properties'
if (-not (Test-Path $keystore)) {
    $alphabet = (48..57) + (65..90) + (97..122)
    $pass = -join ($alphabet | Get-Random -Count 24 | ForEach-Object { [char]$_ })
    & keytool -genkeypair -v -keystore $keystore -alias yallegue -keyalg RSA -keysize 2048 -validity 10000 -storepass $pass -keypass $pass -dname 'CN=Ya llegue, O=Ya llegue, C=MX'
    @(
        'storeFile=release.keystore'
        "storePassword=$pass"
        'keyAlias=yallegue'
        "keyPassword=$pass"
    ) | Set-Content -Path $props -Encoding ascii
    Write-Host "Keystore nuevo. La contrasena quedo en android\keystore.properties. Guardala fuera del repo."
}

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Push-Location (Join-Path $root 'android')
& .\gradlew.bat bundleRelease
$code = $LASTEXITCODE
Pop-Location
if ($code -ne 0) { exit $code }

Write-Host "AAB: android\app\build\outputs\bundle\release\app-release.aab"
