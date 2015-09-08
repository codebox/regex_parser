function set(){
    var data = {};
    return {
        add : function(v){
            data[v] = 1;
            return this;
        },
        size : function(){
            return this.values().length
        },
        values : function(){
            return Object.keys(data);
        },
        contains : function(v){
            return data[v] === 1;
        }
    };
}
