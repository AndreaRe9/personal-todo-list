'use strict'

module.exports.GetDates = function GetDates(startDate, daysToAdd) {
    var weekdays = [];
    for (var i = daysToAdd; i >= 1; i--) {
        var currentDate = new Date();
        currentDate.setDate(startDate.getDate() + i);
        weekdays.push(currentDate);
    }
    return weekdays;
}

module.exports.MonthAsString = function MonthAsString(monthIndex) {
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

    return month[monthIndex];
}

module.exports.DayAsString = function DayAsString(dayIndex) {
    var weekdays = new Array(7);
    weekdays[0] = "Sunday";
    weekdays[1] = "Monday";
    weekdays[2] = "Tuesday";
    weekdays[3] = "Wednesday";
    weekdays[4] = "Thursday";
    weekdays[5] = "Friday";
    weekdays[6] = "Saturday";

    return weekdays[dayIndex];
}

module.exports.isToday = function isToday(date){
    var todaysDate = new Date();
    if(date.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
        return true;
    } else return false;
}

module.exports.getDayColor = function getDayColor(dayindex){
    var class_color;
    console.log(dayindex);
    switch(dayindex){
        case 1:
            class_color="day-one";
            break;
        case 2:
            class_color="day-two";
            break;
        case 3:
            class_color="day-three";
            break;
        case 4:
            class_color="day-four";
            break;
        case 5:
            class_color="day-five";
            break;
        case 6:
            class_color="day-six";
            break;
        default:
            class_color="day-seven";
    }
    return class_color;
}
