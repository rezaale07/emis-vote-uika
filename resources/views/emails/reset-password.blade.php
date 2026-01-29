<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Reset Password EMIS-Vote UIKA</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:560px;background:#ffffff;border-radius:14px;
        box-shadow:0 12px 30px rgba(0,0,0,0.08);overflow:hidden;">

        <!-- HEADER -->
        <tr>
          <td align="center" style="padding:32px 24px;background:#1e3a8a;">
            <img
  src="https://i.ibb.co/fhJntCY/logo-uika-web.png"
  alt="Universitas Ibn Khaldun Bogor"
  width="72"
  style="display:block;margin:0 auto 14px;"
/>

            <h2 style="margin:0;color:#ffffff;font-size:22px;">
              EMIS-Vote UIKA
            </h2>
            <p style="margin:6px 0 0;color:#c7d2fe;font-size:14px;">
              Sistem Pemilihan Mahasiswa<br>
              Universitas Ibn Khaldun Bogor
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:32px 28px;color:#111827;font-size:15px;line-height:1.7;">
            <p>
              Halo <strong>{{ $user->name ?? 'Mahasiswa' }}</strong> 👋
            </p>

            <p>
              Kami menerima permintaan untuk melakukan
              <strong>reset password</strong> pada akun
              <strong>EMIS-Vote UIKA</strong>.
            </p>

            <p>
              Untuk melanjutkan proses reset password, silakan klik tombol di bawah ini:
            </p>

            <p style="text-align:center;margin:36px 0;">
              <a href="{{ $url }}"
                style="
                  background:#2563eb;
                  color:#ffffff;
                  padding:14px 38px;
                  border-radius:12px;
                  text-decoration:none;
                  font-weight:bold;
                  font-size:15px;
                  display:inline-block;
                ">
                🔐 Reset Password
              </a>
            </p>

            <div style="
              background:#f1f5f9;
              border-left:4px solid #2563eb;
              padding:14px 16px;
              border-radius:8px;
              font-size:14px;
              color:#334155;
            ">
              ⏳ Link reset password ini hanya berlaku selama
              <strong>60 menit</strong> sejak email ini dikirim.
            </div>

            <p style="margin-top:20px;font-size:14px;color:#475569;">
              Jika Anda tidak merasa melakukan permintaan ini,
              silakan abaikan email ini. Tidak ada perubahan yang akan terjadi
              pada akun Anda.
            </p>

            <p style="margin-top:32px;">
              Salam hormat,<br>
              <strong>Tim IT Universitas Ibn Khaldun Bogor</strong>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center"
            style="padding:20px;font-size:12px;color:#9ca3af;background:#fafafa;">
            © {{ date('Y') }} Universitas Ibn Khaldun Bogor<br>
            Email ini dikirim otomatis, mohon tidak membalas email ini.
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
