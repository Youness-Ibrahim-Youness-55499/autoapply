param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile
)

$experimentRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = Resolve-Path (Join-Path $experimentRoot "..\..")
$pythonExecutable = Join-Path $repositoryRoot ".pymupdf-venv\Scripts\python.exe"
$scriptPath = Join-Path $experimentRoot "run.py"
$outputDirectory = Join-Path $experimentRoot "output"
$resolvedInput = Resolve-Path -LiteralPath $InputFile

if (-not (Test-Path -LiteralPath $pythonExecutable)) {
  throw "PyMuPDF is not installed. Create the isolated environment described in the experiment README first."
}

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
& $pythonExecutable $scriptPath $resolvedInput --output $outputDirectory

if ($LASTEXITCODE -ne 0) {
  throw "PyMuPDF extraction failed with exit code $LASTEXITCODE."
}

Write-Host "PyMuPDF output is available at $outputDirectory"
