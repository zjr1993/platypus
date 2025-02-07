// class Person {
//     constructor(filter) {
//         this.filter = filter;
//         this.namespace = {};
//         return function(cell){
//             if (cell.Formula){
//                 let retn = cell.Formula.replaceAll('$', '').replaceAll(/[A-Z]+\d+/g, function(match){
//                     let name = wps.Range(match).Offset(-1, 0).Text;
//                     if (filter[name]){
//                         return wps.Range(match).Value2;
//                     }
//                     else {
//                         this.namespace[name] = wps.Range(match).Value2;
//                         return name;
//                     }
//                 });
//                 return retn;
//             }
//             else {
//                 return cell.Value2;
//             }
//         }
//     }
// }

class SubFormula {
    constructor (sub, filter){
        this.sub = sub;
        this.filter = filter;
        this.namespace = {};
    }

    convert(cell)
    {
        for (var Key in this.sub){
            cell = cell.replaceAll(Key, this.sub[Key])
        }
        // let namespace = this.namespace;
        // let filter = this.filter;
        cell = cell.replaceAll(/[A-Z]+\d+/g, (match)=>{
            this.namespace[match] = 12;
            return this.filter[match];
        })
        return cell;
    }

}


let s1 = new SubFormula({'$':'', '^': '**'}, {'M1': 'N1'});

console.log(s1.convert("$M$1^23"));




// class Person {
//     constructor() {
//         this.name = "nicke";
//         // this.time = [1,2];
//     }
//     static locate2() {
//         this.time = [1,2];
//     }
//     locate1(){
//         this.time.push(0);
//     }
// }

// Person.locate2();
// let p1 = new Person();
// let p2 = new Person();
// console.log(Person.time)
// console.log(p2.time)
