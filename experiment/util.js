//function create_tv_array(json_object) {
//    let tv_array = [];
//    for (let i = 0; i < json_object.length; i++) {
//        obj = {};
//        obj.stimulus = json_object[i].stimulus;
//        obj.data = {};
//        obj.data.id = json_object[i].id;
//        obj.data.stimulus = json_object[i].stimulus;
//        tv_array.push(obj)
//    }
//    return tv_array;
//}

function create_tv_array(json_object) {
  return json_object.map(obj => ({
    stimulus: obj.stimulus,   // ✅ top-level string
    id: obj.id,               // also top-level if you like
    data: { id: obj.id }      // optional metadata
  }));
}