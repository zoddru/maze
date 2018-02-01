export default class Utility {

    static randomItem(arr, except) {
        if (!arr || !arr.length)
            return null;

        if (except) {
            arr = arr.filter(item => !except.includes(item));
        }

        return arr[Math.floor(Math.random() * arr.length)];
    }

    static removeItem(arr, item) {
        arr.splice(arr.indexOf(item), 1);
        return arr;
    }
}
