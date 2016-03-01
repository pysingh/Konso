ShopFloorGroupRow = React.createClass ({

  mixins: [ReactMeteorData],

  getInitialState: function() {
    return {
      expand_shopfloors:false,
      HourlyInfoBoxId:Random.id()
    }
  },

  getMeteorData : function(){
    var work_centers_codes = [];
    this.props.shopfloorGroup.shopfloor.map( function(shop_floor){
      shop_floor.workcenter.map(function(work_center){
        work_centers_codes.push(work_center.workcenterCode)
      })
    })
    Meteor.subscribe("fetchPosition");
    var faulty  = [];
    var stopped = [];
    var offline = [];
    var paused  = [];
    var no_data_found = [];
    work_centers_codes.map(function(work_center_code){
      var last_item = DataRecord.findOne({workcenterCode:work_center_code,$or:[{functionCode:"C001"},{functionCode:/S.*/}]},{sort: {recordTime:-1}});
      if (last_item) {
        switch(last_item.currentStatus) {
        case "FAULT":
          faulty.push(last_item)
          break;
        case "STOP":
          stopped.push(last_item)
          break;
        case "OFFLINE":
          offline.push(last_item)
          break;
        case "PAUSE":
          paused.push(last_item)
          break;
        }
      }
      else{
        no_data_found.push(work_center_code)
      }
    })

    return{
      faulty: faulty,
      stopped: stopped,
      offline: offline,
      paused: paused,
      no_data_found: no_data_found,
      work_centers_codes: work_centers_codes,
      ReactiveHourlyFieldsVisibleBoxId: ReactiveHourlyFieldsVisibleBoxId.get()
      // work_centers :dbWorkCenters,
      // is_auth_for_moving : (is_auth_for_moving ? true : false)
    }
  },

  expandShopfloorsAndShowHourlyInfo : function(event){
    this.setState({expand_shopfloors: !this.state.expand_shopfloors});
    this.showHourlyInfo(event);
  },

  showHourlyInfo : function(event){
      var randomId = Random.id();
      this.setState({x:event.clientX,y:event.clientY,HourlyInfoBoxId:randomId});
      ReactiveHourlyFieldsVisibleBoxId.set(randomId)
  },

  componentWillMount: function() {
    $('.material_tooltip').tooltip({delay: 5});
  },

  showHourlyInfo : function(event){
      var randomId = Random.id();
      this.setState({x:event.clientX,y:event.clientY,HourlyInfoBoxId:randomId});
      ReactiveHourlyFieldsVisibleBoxId.set(randomId)
  },

  render : function(){
    var shop_floor_rows = [];
    if (this.state.expand_shopfloors) {
      this.props.shopfloorGroup.shopfloor.forEach(function(shopFloor) {
        shop_floor_rows.push(<ShopFloorRow key={shopFloor.shopfloorCode} shopfloor={shopFloor} />);
      });
    }
    return (
        <div>
          <li className="no-padding">
            <a onClick={this.expandShopfloorsAndShowHourlyInfo} onMouseOver={this.mouseOver} onMouseOut={this.onMouseOut} className={!this.state.expand_shopfloors ?"mdi-content-add collapsible collapsible-accordion":"mdi-content-remove collapsible collapsible-accordion"}>
              {this.props.shopfloorGroup.shopfloorGroupName}<br/>
              {this.data.faulty.length > 0 ? <SummeryInfo color='RED' blink="true" detail_array={this.data.faulty} info_type="Faulty: "/> : ''}
              {this.data.stopped.length > 0 ? <SummeryInfo color='GRAY' detail_array={this.data.stopped} info_type="Stopped: "/> : ''}
              {this.data.offline.length > 0 ? <SummeryInfo color='RED' detail_array={this.data.offline} info_type="Offline: "/> : ''}
              {this.data.paused.length > 0 ? <SummeryInfo color='BLUE' detail_array={this.data.paused} info_type="Paused: "/> : ''}
              {this.data.no_data_found.length > 0 ? <SummeryInfo color='CYAN' detail_array={this.data.no_data_found} info_type="No Data: "/> : ''}
            </a>
          </li>
          <div>
            {this.state.HourlyInfoBoxId === this.data.ReactiveHourlyFieldsVisibleBoxId ? <HourlyInfo levelName={this.props.shopfloorGroup.shopfloorGroupName} x={this.state.x} y={this.state.y} workcenterCodes = {this.data.work_centers_codes}/>:''}
          </div>
          <ul>
            {shop_floor_rows}
          </ul>
        </div>
    );
  }
});
