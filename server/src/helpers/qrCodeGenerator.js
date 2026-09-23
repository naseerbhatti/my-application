// write me to create a QRcode like this ID:SBCA-H1-R1-R1-S12

import QRCode from "qrcode";

export const generateFileNum = async (fileNum) => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(fileNum);
        return qrCodeDataURL;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw error;
    }
}

export const generateQRCode = (house, room, rack, shelf) => {
    return `B${house}-R${room}-R${rack}-S${shelf}`;
}

