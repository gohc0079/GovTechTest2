const generateandPushArrObject = (id, data, arr) => {
    const familyObj = {};
    if (data.length > 0) {
        familyObj.household = id;
        familyObj.families = data;
        arr.push(familyObj)
    }

}

const jsonObject = (array) => {

    const resObject = array.map(({
        household,
        families
    }) => {
        return {
            household,
            families
        }
    })

    return {
        list: resObject
    }

}
const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

module.exports = {
    generateandPushArrObject,
    jsonObject,
    groupBy
}