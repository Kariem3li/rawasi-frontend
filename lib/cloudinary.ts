// lib/cloudinary.ts
import axios from 'axios';
import api from './axios'; 

export const uploadSecurelyToCloudinary = async (file: File, resourceType: 'image' | 'video', onProgress?: (percent: number) => void) => {
    try {
        const signatureRes = await api.post('/upload-signature/', {
            folder: 'rawasi_uploads' 
        });
        
        const { signature, timestamp, cloud_name, api_key } = signatureRes.data;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", api_key);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("folder", 'rawasi_uploads');

        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
            formData,
            { 
                onUploadProgress: (progressEvent) => { 
                    if (progressEvent.total && onProgress) {
                        onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total)); 
                    }
                } 
            }
        );
        
        return res.data.secure_url;
    } catch (error) {
        console.error("Secure Upload Failed:", error);
        throw new Error(`فشل الرفع الآمن لـ ${resourceType}`);
    }
};