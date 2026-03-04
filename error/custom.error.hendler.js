module.exports = class CustomErrorHandler extends  Error{
    constructor(status,message,error = []){
     super(message)
     this.status=status
     this.error=error
    }

static Badrequest(message,error=[]){
 return new CustomErrorHandler(401,message,error)
}
static Forbidden(message,error=[]){
 return new CustomErrorHandler(400,message,error)
}
static Nocontent(message,error=[]){
 return new CustomErrorHandler(204,message,error)
}

}