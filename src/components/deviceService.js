import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TENANT_TOKEN = import.meta.env.VITE_TENANT_TOKEN;

const getAuthHeaders = () => ({
  "X-Tenant-Token": TENANT_TOKEN,
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const fetchDevicesAPI = async (page = 1, limit = 5) => {
  const res = await axios.get(`${API_BASE_URL}/Volt_device?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const deleteDeviceAPI = async (id) => {
  return axios.delete(`${API_BASE_URL}/Volt_device/${id}`, {
    headers: getAuthHeaders(),
  });
};
