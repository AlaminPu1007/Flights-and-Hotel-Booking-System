// get today date include YYYY-MM-DD format
export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * description :- convert date into this format: dd/mm/yyyy
 * @param type
 * @return {valid_date }
 * @created_by :- {Al-Amin}
 */

export const convertValidDate = (inputDate) => {
    const dateObject = new Date(inputDate);
    const formattedDate = `${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear()}`;

    return formattedDate;
};

/**
 * description :- Method to detect if an object is present into root-array
 * @param {root-array, object-id}
 * @return {object}
 * @created_by :- {Al-Amin}
 */

export const getItemFromArray = (rootArray, itemId) =>
    rootArray?.length ? rootArray?.find((i) => i.id == itemId) : null;

/**
 * description :- Method to detect if an object index into root-array
 * @param {root-array, object-id}
 * @return {object}
 * @created_by :- {Al-Amin}
 */

export const findItemIndexFromArray = (rootArray, itemId) =>
    rootArray?.length ? rootArray?.findIndex((i) => i.id == itemId) : null;

/**
 * description :- Generate random id
 * @return {random-id}
 * @created_by :- {Al-Amin}
 */
export const generateUUID = () => {
    // Public Domain/MIT
    let d = new Date().getTime(); //Timestamp
    let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
};
