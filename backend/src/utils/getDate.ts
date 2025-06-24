
export const getDate =():string=>{

    const currentDate = new Date();

    const day = currentDate.getDate()

    const month = currentDate.getMonth()+1;

    const year = currentDate.getFullYear();


    const dayVal = day > 9 ? day : `0${day}`
     const monthVal = month > 9 ? month : `0${month}`



    const date =`${day}/${month}/${year}`
    return date

}