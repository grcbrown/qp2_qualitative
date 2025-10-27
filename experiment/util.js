function create_tv_array(json_object) {
    let tv_array = [];
    for (let i = 0; i < json_object.length; i++) {
        obj = {};
        obj.stimulus = json_object[i].stimulus;
        obj.id = json_object[i].id;
        obj.data = {};
        tv_array.push(obj)
    }
    return tv_array;
}
