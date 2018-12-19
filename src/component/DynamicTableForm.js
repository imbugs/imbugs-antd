import React from "react";
import {Button, Form, Icon, Input, Table} from "antd";

class DynamicTableForm extends React.Component {
  columnsInfo = this.props.columnsInfo || [{
    title: '列名1',
    key: 'column1'
  }, {
    title: '列名2',
    key: 'column2'
  }];
  tableInfo = this.props.tableInfo || {
    btnLabel: '添加'
  };
  cb = this.props.onChange;

  state = {
    dataSource: null
  };

  componentWillMount() {
    this.initDataSource();
  }

  initDataSource = () => {
    if (this.state.dataSource == null) {
      let ds = this.props.dataSource && (Array.isArray(this.props.dataSource) && this.props.dataSource || [this.props.dataSource]) || [{}]
      this.setState({dataSource: ds})
    }
  };

  isEmptyRow = (rowData) => {
    for (let i in this.columnsInfo) {
      let key = this.columnsInfo[i]['key'];
      if (rowData[key]) {
        return false;
      }
    }
    return true
  };

  doUpdate = () => {
    let data = [];
    for (let i in this.state.dataSource) {
      if (!this.isEmptyRow(this.state.dataSource[i])) {
        data.push(this.state.dataSource[i]);
      }
    }
    this.cb && this.cb(data);
  };

  onChange = (e, record, field) => {
    record[field] = e.target.value;
    this.setState({})
    this.doUpdate();
  };


  add = () => {
    this.setState({dataSource: [...this.state.dataSource, {}]})
    this.doUpdate();
  };

  del = (record) => {
    this.setState({dataSource: this.state.dataSource.filter(e => e !== record)})
    this.doUpdate();
  };

  columns = (() => {
    var merge = [];
    for (var i in this.columnsInfo) {
      var item = this.columnsInfo[i];
      const {title, key} = item;
      var render = record => {
        return <Input placeholder={`请填写${title}`} value={record[key]}
                      onChange={(e) => this.onChange(e, record, key)}/>
      };
      merge.push({
        ...item,
        render
      });
    }
    merge.push({
      title: '',
      key: 'action',
      width: 60,
      align: 'right',
      render: record => {
        return <a onClick={(e) => this.del(record)}>删除</a>
      }
    });
    return merge;
  })();

  render() {
    /** 上层props.dataSource变更时需要刷新数据 */
    this.initDataSource();
    let rowKey = 0;
    return (
      <div>
        <Table
          pagination={false}
          columns={this.columns}
          rowKey={() => {
            return rowKey++
          }}
          dataSource={this.state.dataSource}>
        </Table>
        <div style={{marginTop: 20}}></div>
        <Button type="dashed" onClick={this.add} style={{width: '100%'}}>
          <Icon type="plus"/>{this.tableInfo.btnLabel}
        </Button>
      </div>
    )
  }
}

export default Form.create()(DynamicTableForm)
