console.log("Startin on test mode...")
process.env.node_jwtPrivateKey = "_A8gW+$LxW-DE6uF-hafnqk*?nR_tf"
process.env.node_mailUsername="belibahomawebservice@gmail.com"
process.env.node_mailPassword="BelibaHoma@123" 
process.env.node_mongoAddress="mongodb+srv://testsuser:BelibaHoma123@cluster0-dmeus.gcp.mongodb.net/backup?retryWrites=true&w=majority"
require('./index');