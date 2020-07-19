const delay = ms => new Promise(res => setTimeout(res, ms));

function arrayRemove(arr, value) { return arr.filter(function(ele){ return ele != value; });}


//Calculate time duration in minutes
function calculateDuration(start,end) {
    let start_m = Number(start.split(':')[0])*60 + Number(start.split(':')[1]);
    let end_m = Number(end.split(':')[0])*60 + Number(end.split(':')[1]);
    return Math.abs(start_m-end_m);
}

function buildQueryDate(date_datepicker){
    date = new Date(date_datepicker);
    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();
    let formatted_date = year+'-'+("0" + month).slice(-2)+'-'+("0" + day).slice(-2);
    return formatted_date;
}

