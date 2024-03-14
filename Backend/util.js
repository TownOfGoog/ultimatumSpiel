export async function wait(){
    return new Promise((resolve) => setTimeout(resolve,20));
}

export async function conditionWait(client, bestState){
    console.log(client.readyState,999, bestState);
    if(client.readyState == bestState){
        console.log("offen",client.readyState,999, bestState);
        return 0
    }
    await wait()
    await conditionWait(client, bestState)
}