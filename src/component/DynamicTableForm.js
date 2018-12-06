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

  state = {
    dataSource: this.props.dataSource && (Array.isArray(this.props.dataSource) && this.props.dataSource || [this.props.dataSource]) || [{}]
  };

  doUpdate = () => {
    let cb = this.props.onChange;
    let data = this.state.dataSource.slice();
    cb && cb(data);
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
      align: 'right',
      render: record => {
        return <a onClick={(e) => this.del(record)}>删除</a>
      }
    });
    return merge;
  })();

  render() {
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
          <Icon type="plus"/>添加
        </Button>
      </div>
    )
  }
}

export default Form.create()(DynamicTableForm)
