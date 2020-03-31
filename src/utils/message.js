const generateMessage = (username,message)=>{
    return {
        username,
        text:message,
        createdAt:new Date().getTime()
    }
}

const generateLocation = (username,message)=>{
    return {
        username,
        url:message,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocation 
}