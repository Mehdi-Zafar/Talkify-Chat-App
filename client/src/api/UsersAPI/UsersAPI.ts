import httpClient from "../httpClient";

export const getUserProfile = async () => {
  try {
    const res = await httpClient.get("/users/get/profile", {
      headers: { "hide-toast": true },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("image", userData?.image); // Replace `selectedFile` with the actual file object
    formData.append("username", userData?.username);
    formData.append("about", userData?.about);
    const res = await httpClient.post("/users/upload-user-data", formData);
    return res.data;
  } catch (error) {
    throw error;
  }
};
