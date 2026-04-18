import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export const saveVendor = async (vendorData) => {
    try {
        await addDoc(collection(db, "vendors"), vendorData);
        console.log("Vendor saved successfully");
    } catch (error) {
        console.error("Error saving vendor:", error);
    }
};