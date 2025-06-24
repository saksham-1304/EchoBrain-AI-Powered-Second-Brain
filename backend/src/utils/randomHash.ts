export const random=(num:number):string=>{


    const key = "abab45GASafafs34243efqQqE"
    const len = key.length

    let ans=""

    for(let i =0;i<num;i++){
        ans= ans + key[(Math.floor(Math.random()*len))]
    }


    return ans;
}