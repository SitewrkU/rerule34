$Host.UI.RawUI.WindowTitle = "Re:R34 - Launcher"
try { $Host.UI.RawUI.BackgroundColor = "Black"; $Host.UI.RawUI.ForegroundColor = "Green" } catch {}
Clear-Host
try {

    # ── Job Object: коли цей процес помре (ЛЮБИМ способом), Windows сама вб'є дочірні ──
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    using System.Diagnostics;

    public class Job : IDisposable {
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
        static extern IntPtr CreateJobObject(IntPtr a, string lpName);

        [DllImport("kernel32.dll")]
        static extern bool SetInformationJobObject(IntPtr job, int infoType, IntPtr lpJobObjectInfo, uint cbJobObjectInfoLength);

        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);

        [StructLayout(LayoutKind.Sequential)]
        struct IO_COUNTERS {
            public ulong ReadOperationCount, WriteOperationCount, OtherOperationCount;
            public ulong ReadTransferCount, WriteTransferCount, OtherTransferCount;
        }
        [StructLayout(LayoutKind.Sequential)]
        struct JOBOBJECT_BASIC_LIMIT_INFORMATION {
            public long PerProcessUserTimeLimit, PerJobUserTimeLimit;
            public uint LimitFlags;
            public UIntPtr MinimumWorkingSetSize, MaximumWorkingSetSize;
            public uint ActiveProcessLimit;
            public UIntPtr Affinity;
            public uint PriorityClass, SchedulingClass;
        }
        [StructLayout(LayoutKind.Sequential)]
        struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION {
            public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
            public IO_COUNTERS IoInfo;
            public UIntPtr ProcessMemoryLimit, JobMemoryLimit, PeakProcessMemoryUsed, PeakJobMemoryUsed;
        }

        IntPtr handle;
        public Job() {
            handle = CreateJobObject(IntPtr.Zero, null);
            var info = new JOBOBJECT_BASIC_LIMIT_INFORMATION { LimitFlags = 0x2000 }; // KILL_ON_JOB_CLOSE
            var ext = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION { BasicLimitInformation = info };
            int length = Marshal.SizeOf(typeof(JOBOBJECT_EXTENDED_LIMIT_INFORMATION));
            IntPtr ptr = Marshal.AllocHGlobal(length);
            Marshal.StructureToPtr(ext, ptr, false);
            SetInformationJobObject(handle, 9, ptr, (uint)length);
            Marshal.FreeHGlobal(ptr);
        }
        public void AddProcess(IntPtr processHandle) { AssignProcessToJobObject(handle, processHandle); }
        public void Dispose() {}
    }

    public class WinTools {
        [DllImport("user32.dll")]
        public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
        [DllImport("kernel32.dll")]
        public static extern IntPtr GetConsoleWindow();
    }
"@

    $job = New-Object Job

    # ── Головне вікно "завжди зверху" ──
    $HWND_TOPMOST = [IntPtr]-1
    $SWP_NOMOVE = 0x0002; $SWP_NOSIZE = 0x0001
    $consoleHandle = [WinTools]::GetConsoleWindow()
    [WinTools]::SetWindowPos($consoleHandle, $HWND_TOPMOST, 0, 0, 0, 0, $SWP_NOMOVE -bor $SWP_NOSIZE) | Out-Null

    # ── локалка ip ──
    $LocalIP = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" -and $_.PrefixOrigin -ne "WellKnown" } |
            Select-Object -First 1 -ExpandProperty IPAddress)

    $BackendPort = 3000
    $FrontendPort = 5173
    $Root = $PSScriptRoot

    function Line($text) { Write-Host $text -ForegroundColor Green }

    Line ""
    Line "  +==============================================+"
    Line "  |                    Re:R34                    |"
    Line "  +==============================================+"
    Line ""
    Line "  -- Клiєнт ---------------------------------------"
    Line "    ПК:       http://localhost:$FrontendPort"
    if ($LocalIP) { Line "    Телефон:  http://${LocalIP}:$FrontendPort" }
    Line ""
    Line "  -- Сервер ---------------------------------------"
    Line "    ПК:       http://localhost:$BackendPort"
    if ($LocalIP) { Line "    Телефон:  http://${LocalIP}:$BackendPort" }
    Line ""
    Line "  --------------------------------------------------"
    if (-not $LocalIP) { Line "  [!] Не вдалося визначити локальну IP-адресу." }
    else { Line "  Телефон має бути в тiй самiй Wi-Fi мережi." }
    Line "  --------------------------------------------------"
    Line ""

    Line "  > Стартую сервер..."
    $backend = Start-Process cmd.exe -ArgumentList '/k', 'title Backend && npm run dev' -WorkingDirectory (Join-Path $Root 'server') -WindowStyle Minimized -PassThru
    $job.AddProcess($backend.Handle)
    Line "    сервер запущено (PID $($backend.Id)), вiкно згорнуто"

    Start-Sleep -Milliseconds 400

    Line "  > Стартую клiєнт..."
    $frontend = Start-Process cmd.exe -ArgumentList '/k', 'title Frontend && npm run dev -- --host' -WorkingDirectory (Join-Path $Root 'client') -WindowStyle Minimized -PassThru
    $job.AddProcess($frontend.Handle)
    Line "    клiєнт запущено (PID $($frontend.Id)), вiкно згорнуто"

    Line ""
    Line "  Все запущено. Закрий це вiкно, щоб зупинити обидва сервери."
    Line ""

    # ── Тримаємо головне вікно живим; закриття (навіть хрестиком) вб'є job, а з ним і дітей ──
    Wait-Process -Id $backend.Id, $frontend.Id -ErrorAction SilentlyContinue

}
catch {
    Write-Host ""
    Write-Host "  ==================== ПОМИЛКА ====================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host $_.InvocationInfo.PositionMessage -ForegroundColor Red
    Write-Host ""
    Write-Host "  ===================================================" -ForegroundColor Red
    Write-Host ""
    Read-Host "  Натисни Enter, щоб закрити"
}