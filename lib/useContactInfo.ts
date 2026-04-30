// hooks/useContactInfo.ts
import { useState, useEffect } from "react";
import api from "@/lib/axios";

export const useContactInfo = () => {
    const [contactInfo, setContactInfo] = useState({ support_phone: "", whatsapp_number: "" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const res = await api.get('/contact-info/');
                let data = res.data;
                let supportPhone = "01000000000";
                let whatsappNum = "20100000000";

                if (Array.isArray(data) && data.length > 0) {
                    supportPhone = data[0].support_phone || supportPhone;
                    whatsappNum = data[0].whatsapp_number || whatsappNum;
                } else if (data.support_phone || data.whatsapp_number) {
                    supportPhone = data.support_phone || supportPhone;
                    whatsappNum = data.whatsapp_number || whatsappNum;
                }

                setContactInfo({ support_phone: supportPhone, whatsapp_number: whatsappNum });
            } catch (error) {
                console.error("Error fetching contacts:", error);
                setContactInfo({ support_phone: "01000000000", whatsapp_number: "20100000000" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchContactInfo();
    }, []);

    return { contactInfo, isLoading };
};