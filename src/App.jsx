import React, { useState } from "react";

const App = () => {
  const [otr, setOtr] = useState("");
  const [dpPersen, setDpPersen] = useState("");
  const [jangkaWaktu, setJangkaWaktu] = useState("");
  const [hasil, setHasil] = useState(null);

  const hitungAngsuran = () => {
    const otrVal = parseFloat(otr);
    const dpVal = (parseFloat(dpPersen) / 100) * otrVal;
    const pokokUtang = otrVal - dpVal;
    const bulan = parseInt(jangkaWaktu);

    // Tentukan bunga sesuai flowchart
    let bunga = 0;
    if (bulan <= 12) bunga = 0.12;
    else if (bulan <= 24) bunga = 0.14;
    else bunga = 0.165;

    const totalBayar = pokokUtang + pokokUtang * bunga;
    const angsuranPerBulan = Math.round(totalBayar / bulan);

    // Generate jadwal angsuran
    const startDate = new Date("2024-01-25");
    const jadwal = Array.from({ length: bulan }, (_, i) => {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      return {
        ke: i + 1,
        tanggal: date.toISOString().split("T")[0],
        angsuran: angsuranPerBulan,
      };
    });

    const hasilObj = {
      otr: otrVal,
      dp: dpVal,
      pokokUtang,
      bunga,
      angsuranPerBulan,
      jangkaWaktu: bulan,
      jadwal,
    };

    setHasil(hasilObj);
    localStorage.setItem("angsuran_sugus_form", JSON.stringify(hasilObj));
  };

  // Hitung total angsuran jatuh tempo per 14 Agustus 2024
  const tanggalBatas = new Date("2024-08-14");
  const totalJatuhTempo = hasil?.jadwal
    ?.filter((item) => new Date(item.tanggal) <= tanggalBatas)
    .reduce((total, item) => total + item.angsuran, 0);

  // Hitung denda dari angsuran yang belum dibayar per 14 Agustus 2024
  const dendaList = hasil?.jadwal
    ?.filter(
      (item) =>
        new Date(item.tanggal) <= tanggalBatas &&
        new Date(item.tanggal) > new Date("2024-05-31") // Setelah Mei 2024
    )
    .map((item) => {
      const jatuhTempo = new Date(item.tanggal);
      const selisihHari = Math.floor(
        (tanggalBatas - jatuhTempo) / (1000 * 60 * 60 * 24)
      );
      const denda = Math.round(item.angsuran * 0.001 * selisihHari);
      return {
        kontrakNo: "AGR00001",
        clientName: "SUGUS",
        installmentNo: item.ke,
        hariTelat: selisihHari > 0 ? selisihHari : 0,
        totalDenda: selisihHari > 0 ? denda : 0,
      };
    });

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">Simulasi Kredit Mobil</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Harga Mobil (OTR)</label>
          <input
            type="number"
            value={otr}
            onChange={(e) => setOtr(e.target.value)}
            className="mt-1 w-full p-2 border rounded"
            placeholder="Contoh: 240000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Down Payment (%)</label>
          <input
            type="number"
            value={dpPersen}
            onChange={(e) => setDpPersen(e.target.value)}
            className="mt-1 w-full p-2 border rounded"
            placeholder="Contoh: 20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Jangka Waktu (bulan)
          </label>
          <input
            type="number"
            value={jangkaWaktu}
            onChange={(e) => setJangkaWaktu(e.target.value)}
            className="mt-1 w-full p-2 border rounded"
            placeholder="Contoh: 18"
          />
        </div>
        <button
          onClick={hitungAngsuran}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Hitung Angsuran
        </button>
      </div>

      {hasil && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Hasil Simulasi</h2>
          <ul className="mb-4">
            <li>Pokok Utang: Rp {hasil.pokokUtang.toLocaleString("id-ID")}</li>
            <li>Bunga: {(hasil.bunga * 100).toFixed(1)}%</li>
            <li>
              Angsuran per Bulan:{" "}
              <strong>
                Rp {hasil.angsuranPerBulan.toLocaleString("id-ID")}
              </strong>
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">Jadwal Angsuran</h3>
          <table className="w-full border border-gray-300 text-sm mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Ke</th>
                <th className="border px-2 py-1">Tanggal Jatuh Tempo</th>
                <th className="border px-2 py-1">Angsuran</th>
              </tr>
            </thead>
            <tbody>
              {hasil.jadwal.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{item.ke}</td>
                  <td className="border px-2 py-1 text-center">
                    {item.tanggal}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    Rp {item.angsuran.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tabel Total Angsuran Jatuh Tempo */}
          <div className="bg-gray-100 p-4 rounded mb-4">
            <h3 className="font-semibold mb-2">
              Total Angsuran Jatuh Tempo per 14 Agustus 2024
            </h3>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="border px-2 py-1">KONTRAK NO</th>
                  <th className="border px-2 py-1">CLIENT NAME</th>
                  <th className="border px-2 py-1">
                    TOTAL ANGSURAN JATUH TEMPO
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border px-2 py-1 text-center">AGR00001</td>
                  <td className="border px-2 py-1 text-center">SUGUS</td>
                  <td className="border px-2 py-1 text-right font-semibold">
                    Rp {totalJatuhTempo?.toLocaleString("id-ID") ?? "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tabel Denda Keterlambatan */}
          {dendaList && dendaList.length > 0 && (
            <div className="bg-red-50 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">
                Tabel Denda Keterlambatan (hingga 14 Agustus 2024)
              </h3>
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="border px-2 py-1">KONTRAK NO</th>
                    <th className="border px-2 py-1">CLIENT NAME</th>
                    <th className="border px-2 py-1">INSTALLMENT NO</th>
                    <th className="border px-2 py-1">HARI KETERLAMBATAN</th>
                    <th className="border px-2 py-1">TOTAL DENDA</th>
                  </tr>
                </thead>
                <tbody>
                  {dendaList.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1 text-center">
                        {item.kontrakNo}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.clientName}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.installmentNo}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.hariTelat}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        Rp {item.totalDenda.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
