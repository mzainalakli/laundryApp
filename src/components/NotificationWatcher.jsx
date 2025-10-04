import { useEffect, useRef } from "react";

const NotificationWatcher = ({ apiBaseUrl, tenantToken }) => {
  const sentNotificationsRef = useRef({});
  const pollingInterval = useRef(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const saved = localStorage.getItem("sentNotifications");
    if (saved) {
      sentNotificationsRef.current = JSON.parse(saved);
    }

    const fetchLogs = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const userId = parseInt(localStorage.getItem("user_id"), 10);

      // ❗ Stop polling jika user logout
      if (!token || !role || !userId) {
        clearInterval(pollingInterval.current);
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/Volt_device/Log`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Tenant-Token": tenantToken,
          },
        });

        if (res.status === 401) {
          console.warn("❌ Token tidak valid. Stop polling.");
          clearInterval(pollingInterval.current);
          return;
        }

        if (!res.ok) throw new Error("Gagal ambil data log");
        const response = await res.json();
        const logs = response.result || [];
        for (const log of logs) {
          if (sentNotificationsRef.current[log.id]) continue;

          const isAnomaly =
            log.StatusMessage?.includes("⚠") || log.StatusMessage?.includes("❌");
          if (!isAnomaly) continue;

          const deviceRes = await fetch(`${apiBaseUrl}/Volt_device/${log.volt_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Tenant-Token": tenantToken,
            },
          });

          if (!deviceRes.ok) {
            console.warn("⚠ Gagal ambil detail perangkat:", log.volt_id);
            continue;
          }

          const deviceData = await deviceRes.json();

          if (role === "karyawan" && deviceData.user_id !== userId) {
            continue;
          }

          const deviceName = deviceData.name || `Perangkat ID ${log.volt_id}`;

          if ("Notification" in window && Notification.permission === "granted") {
            const notif = new Notification(deviceName, {
              body: log.StatusMessage,
              icon: "/logo.jpg",
            });
            notif.onclick = () => {
              window.focus();
              window.location.href = "/riwayat-notifikasi";
            };
          }

          sentNotificationsRef.current[log.id] = true;
        }

        localStorage.setItem(
          "sentNotifications",
          JSON.stringify(sentNotificationsRef.current)
        );
      } catch (err) {
        console.error("❌ Gagal polling log:", err);
      }
    };

    fetchLogs();
    pollingInterval.current = setInterval(fetchLogs, 30000);

    return () => clearInterval(pollingInterval.current);
  }, [apiBaseUrl, tenantToken]);

  return null;
};
export default NotificationWatcher;
