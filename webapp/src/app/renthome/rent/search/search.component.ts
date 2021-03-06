import { Component, OnInit} from '@angular/core';
import { SearchService } from './search.service';
import { Data } from '../../dataformat';
 
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  bedroomNum:number;
  bathroomNum:number;
  grossarea:Array<Number>=[1000,7500];
  selectedprice:number;
  selectedhometype:string;
  selectedsort:string;
  locationlist: Array<string> = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','Washington D.C.'];
  listOfSelectedLocation:string;
  homelist:Data[];
  error:any;
  
  constructor(public searchService:SearchService) {}
  
  ngOnInit(): void {
    this.showData();
  }

  // sort json
  jsonSort(array:any, field:any, reverse:any) {
    if(array.length < 2 || !field || typeof array[0] !== "object") return array;
    if(typeof array[0]['home_description'][field] === "number") {
      array.sort(function(x:any, y:any) { return x['home_description'][field] - y['home_description'][field]});
    }

    if(typeof array[0]['home_description'][field] === "string") {
      array.sort(function(x:any, y:any) { return x['home_description'][field].localeCompare(y['home_description'][field])});
    }

    if(reverse) {
      array.reverse();
    }
    return array;
  }

  // sort
  sort():void{
    if(this.selectedsort=='Price(low-high)'){
      this.homelist = this.jsonSort(this.homelist,"price",false)
    }else if(this.selectedsort=='Price(high-low)'){
      this.homelist = this.jsonSort(this.homelist,"price",true)
    }
    else if(this.selectedsort=='Bedroom Number'){
      this.homelist = this.jsonSort(this.homelist,"bedroom_no",false)
    }else if(this.selectedsort=='Bathroom Number'){
      this.homelist = this.jsonSort(this.homelist,"bathroom_no",false)
    }else{
      this.homelist = this.jsonSort(this.homelist,"user_id",false)
    }
  }

  // get
  showData():void {
    this.searchService.getData()
      .subscribe(
        data => {
          this.homelist = data.filter(item=>item.rentout.home_availablestatus===true);
          this.grossarea = undefined;
          this.selectedhometype =undefined;
          this.listOfSelectedLocation = undefined;
          this.selectedprice = undefined;
          this.bedroomNum = undefined;
          this.bathroomNum = undefined;
        }, // success path
        error => this.error = error // error path
      );
      
  }

  // get one by condition
  search() {
    if (this.selectedprice || this.selectedhometype || this.listOfSelectedLocation || this.grossarea || this.bedroomNum || this.bathroomNum) {
      this.searchService
        .searchOne(this.selectedprice,this.selectedhometype,this.listOfSelectedLocation,this.grossarea,this.bedroomNum,this.bathroomNum)
        .subscribe(data => (this.homelist = data));
    }
  }

  // put: rent home
  update(data: any) {
    if(data.rentout.home_availablestatus == true){
      
      this.searchService.getCurrentUser()
      .subscribe(
        currentUser => {
          if (currentUser.data._id) {
            if ( currentUser.data._id !== data.user_id){
              // change selected rentout status
              data.rentout.home_availablestatus = false;
              // change selected rentin user
              data.rentinuser_id = currentUser.data._id;
              // change rentin status
              data.rentin.home_status = true;
            
              this.searchService.updateData(data._id,data).subscribe();
              alert("Rent success!");
              this.showData();
            }else{
              alert("Sorry, you can't rent your own home");
            }

          }

        }
      );
      
    }
    else{
      alert("Not available!");
    }
    
  }

}
