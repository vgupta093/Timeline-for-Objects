import { LightningElement, wire, api } from 'lwc';
import getOpportunities from '@salesforce/apex/CustomerInteractionTimeline_helper.getOpportunities';
import { NavigationMixin } from "lightning/navigation";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from "c/pubsub";


export default class AccountView extends NavigationMixin(LightningElement) {
  @wire(CurrentPageReference) pageRef;
  @api recordId;
  sortedArray;
  responseArray;
  selectedId;
  openAll = false;
  openFilter = false;
  opportunityView = true;
  _selectedFilter;

  // wire methods
  @wire(getOpportunities, { recordId: '$recordId' })
  contactDetails({ error, data }) {
    if (error) {
      console.log(error);
    }
    else if (data) {
      this.responseArray = JSON.parse(JSON.stringify(data));

      this.responseArray.sort((a, b) => {
        let d = new Date(b.CreatedDate);
        let c = new Date(a.CreatedDate);
        console.log(d - c);
        return d - c;
      });
      this.sortedArray = JSON.parse(JSON.stringify(this.responseArray));
    }
  }

  //handlers
  handleRedirect(event) {
    event.stopPropagation();
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: event.target.dataset.recid,
        actionName: "view"
      }
    });
  }

  getDetails(event) {
    this.selectedId = event.currentTarget.dataset.targetid;
    console.log(this.selectedId);
    if (this.template.querySelector('[data-targetid="' + this.selectedId + '"]').querySelector('[data-icontype="chevron"]').iconName === "utility:chevronright")
      this.template.querySelector('[data-targetid="' + this.selectedId + '"]').querySelector('[data-icontype="chevron"]').iconName = "utility:chevrondown";
    else
      this.template.querySelector('[data-targetid="' + this.selectedId + '"]').querySelector('[data-icontype="chevron"]').iconName = "utility:chevronright"


    fireEvent(this.pageRef, "selectedId", this.selectedId);
  }

  handleExpandAllAndCollapseAll(event) {
    if (event.target.dataset.action === "expandall") this.openAll = true;
    else {
      this.openAll = false;
    }
  }

  showFilterPanel(event) {
    if (this.openFilter === false) {
      this.template.querySelector('[data-elementtype="buttonicon"]').variant =
        "inverse";

      this.template.querySelector(
        '[data-elementtype="buttonicon"]'
      ).style.background = "rgb(28, 81, 151)";

      this.openFilter = true;
    } else {
      this.template.querySelector('[data-elementtype="buttonicon"]').variant =
        "";
      this.template.querySelector(
        '[data-elementtype="buttonicon"]'
      ).style.background = "white";

      this.openFilter = false;
    }
  }

  handleSearch(event) {
    //console.log(event.target.value);
    if (event.target.value != "") {
      this.sortedArray = this.responseArray.filter(item => {
          if (item.Name.toLowerCase().includes(event.target.value.toLowerCase()))
            return true;
      })
    }
    else
      this.sortedArray = this.responseArray;

  }


  handleFilterData(event) {
    this.sortedArray = event.detail.filtered;
    this._selectedFilter = event.detail.selected;
  }

}