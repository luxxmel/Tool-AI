<?php
header('Content-Type: text/plain; charset=utf-8');

$secret = 'biettuot_sync_secret_2026';
if (!isset($_GET['token']) || $_GET['token'] !== $secret) {
    http_response_code(403);
    die("Forbidden: Invalid Token\n");
}

$repoPath = '/home/cuacongn/biettuot.io.vn';
$gitBypaths = [
    '/usr/local/cpanel/3rdparty/bin/git',
    '/usr/bin/git',
    '/bin/git',
    'git'
];

$gitExec = 'git';
foreach ($gitBypaths as $p) {
    if (@file_exists($p) && @is_executable($p)) {
        $gitExec = $p;
        break;
    }
}

echo "Using Git: " . $gitExec . "\n";
echo "Target Dir: " . $repoPath . "\n";

$commands = [
    "cd $repoPath 2>&1",
    "$gitExec --git-dir=$repoPath/.git --work-tree=$repoPath fetch origin 2>&1",
    "$gitExec --git-dir=$repoPath/.git --work-tree=$repoPath reset --hard origin/main 2>&1",
    "mkdir -p $repoPath/tmp && touch $repoPath/tmp/restart.txt 2>&1"
];

$fullCmd = implode(' && ', $commands);
echo "Executing: $fullCmd\n\n";

$output = [];
$returnVar = 0;

if (function_exists('exec')) {
    exec($fullCmd, $output, $returnVar);
    echo implode("\n", $output) . "\n";
    echo "Return code: " . $returnVar . "\n";
} elseif (function_exists('shell_exec')) {
    echo shell_exec($fullCmd);
} elseif (function_exists('passthru')) {
    passthru($fullCmd);
} elseif (function_exists('system')) {
    system($fullCmd);
} else {
    echo "ERROR: All shell execution functions are disabled in php.ini on this hosting.\n";
    echo "Please use cPanel Git Version Control: Click 'Update from Remote' -> 'Deploy HEAD Commit'.\n";
}

echo "\nDeploy script finished.\n";
