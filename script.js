const text_area = document.querySelector('#text-area');
const ungrouped_tbody = document.querySelector('#ungrouped-tbody');
const grouped_tbody = document.querySelector('#grouped-tbody');

let raw_data; // input from user: this is a string
let data; // array of numbers
let frequency_object; // object containing raw_score: [raw_score, raw_score, ...]
let frequency_total = 0; // total of the frequency : this should total to the number of raw_data

// the object should look like
// grouped[0] {
//     "10 - 20": {
//         cumulative_freq: value,
//         frequency: value,
//         relative_freq: "value / value"
//     }
// }
let grouped = []; // an array of class_range info



function reset() {
    raw_data = "";
    data = [];
    frequency_object = {};
    frequency_total = 0;
    grouped = []
}


function calculate() {

    // every time user clicks go, we should reset all value first
    reset();
    
    calculateUngrouped();
    generateUngroupedDistributionTable();

    calculateGrouped();
    generateGroupedDistributionTable();

    
}

function calculateUngrouped() {
    raw_data = text_area.value.replaceAll(/\s/g, ' ').split(' ');
    console.log(raw_data)
    data = raw_data.reduce((final_value, cur_data) => {

        if (final_value == undefined)
            final_value = []

        if (!isNaN(parseInt(cur_data)))
            final_value.push(parseInt(cur_data));

        return final_value;

    }, []);

    
    data.sort();
    // console.log(data);

    // frequency_object should look like
    //  42: [42, 42, 42, 42]
    //  10: [10, 10]
    //  19: [19]
    frequency_object = data.reduce((freq, item) => {

        if (freq[item] == null) freq[item] = []
        freq[item].push(item)

        return freq;

    }, {});

    // count the frequency of each raw_scores
    for (let key of Object.keys(frequency_object))
        frequency_total += frequency_object[key].length;
    
    // console.log("frequency total is " + frequency_total)
    // console.log(frequency_object);


}

function generateUngroupedDistributionTable() {

    let retval = []
    for (let key of Object.keys(frequency_object)) {
        retval.push(`
            <tr>
                <td>${key}</td>
                <td>${frequency_object[key].length}</td>
            </tr>
        `);
    }

    retval.push(`
        <tr class="bg-success text-white">
            <td> Total </td>
            <td> ${frequency_total} </td>
        </tr>
    `);

    
    ungrouped_tbody.innerHTML = retval.join('');
    
}

function calculateGrouped () {
    const max = Math.max(...data);
    const min = Math.min(...data);
    let number_of_classes = Math.ceil(1 + (3.322 * Math.log10(data.length)));
    let width_interval = (max - min) / number_of_classes;
    width_interval = Math.ceil(width_interval);
    
    grouped = [];
    for (let i = 0, start = min; i < number_of_classes; i++) {

        // get the range of raw_scores
        let range_start = start;
        let range_end = range_start + width_interval - 1;
        let key = `${range_start} - ${range_end}`
        
        // object of the class of raw_scores (row) : 10 - 12, 13 - 15, 16 - 18, ...
        let new_object = {};

        const freq = getFrequency(key);
        const relative_freq = getLowestTerm(`${freq} / ${frequency_total}`);

        // Object.keys(grouped[i - 1]) => gets the key of the previous object to access its member
        // and add it to the freq of the current class_range
        const cum_freq = i == 0 ? freq : grouped[i - 1][Object.keys(grouped[i - 1])].cumulative_freq + freq;
        new_object[key] = {
            frequency: freq,
            relative_freq: relative_freq,
            cumulative_freq: cum_freq
        }
        grouped.push(new_object);
        
        start = range_end + 1;
    }


    // console.log(grouped);

}

function getFrequency(class_range) {
    
    let total = 0;

    // gets the start and end of the range, i.e, 10 - 15
    // [10, 15]
    let all_number_in_range = class_range.split(' - ');
    
    // loops through the frequency_object and counts the
    // total frequency if key is between start and end of the class_range
    for (let key of Object.keys(frequency_object)) {
        if (key >= parseInt(all_number_in_range[0]) && key <= parseInt(all_number_in_range[1]))
            total += frequency_object[key].length;
    }

    return total;


}

function generateGroupedDistributionTable() {

    let retval = [];
    let total = 0;
    let relative = 0;
    grouped.forEach((group) => {
        const key = Object.keys(group);
        retval.push(`
            <tr>
                <td>${key}</td>
                <td>${group[key].frequency}</td>
                <td>${group[key].relative_freq}</td>
                <td>${group[key].cumulative_freq}</td>
            </tr>
        `);

        total += group[key].frequency;
        relative += eval(group[key].relative_freq);
    });

    
    retval.push(`
        <tr class="text-white bg-success">
            <td> Total </td>
            <td> ${total} </td>
            <td> ${Math.ceil(relative)} </td>
            <td> </td>
        </tr>
    `);

    grouped_tbody.innerHTML = retval.join('');
}


function getLowestTerm(fraction) {

    const fraction_separated = fraction.split('/');
    let numerator = fraction_separated[0];
    let denominator = fraction_separated[1];

    // frequency is zero, so no need to get lowest term
    if (numerator == 0)
        return `0`;
    
    while (denominator) {
        let temp = numerator % denominator;
        numerator = denominator;
        denominator = temp;
    }

    let num = fraction_separated[0] / numerator;
    let den = fraction_separated[1] / numerator;

    return `${num} / ${den}`;

}