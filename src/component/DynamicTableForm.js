import map from "lodash/map";
import React from "react";
import { Button, Form, Icon, Input, Table } from "antd";

/**
 * 动态表单
 * @param key react的key数据, 可设置key={type}, 当type变动的时候table重新挂载，如果需要重设table可设置此项
 * @param columnsInfo 列信息
 * @param tableInfo 表信息
 * @param onChange 更新内容事件
 * @param onRender 在render的时候回调修改dataSource内容, 可为每一行添加disable参数
 */
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

  /** 记录是否已经变化, 如果变化后props.dataSource数据不再对表格产生影响 */
  changed = false;
  state = {
    dataSource: [],
  };


  doUpdate = (change = true) => {
    this.changed = change;
    let data = [];
    for (let i in this.state.dataSource) {
      if (!this.isEmptyRow(this.state.dataSource[i])) {
        data.push(this.state.dataSource[i]);
      }
    }
    this.cb && this.cb(data);
  };

  onRender = () => {
    if (typeof (this.props.onRender) === 'function') {
      let updateDataSource = this.props.onRender(this.state.dataSource);
      this.state.dataSource = Array.isArray(updateDataSource) ? updateDataSource : this.state.dataSource;
    }
  };

  onChange = (e, record, field) => {
    record[field] = e.target.value;
    this.setState({}, this.doUpdate)
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

  add = () => {
    this.setState({ dataSource: [...this.state.dataSource, {}] }, this.doUpdate)
  };

  del = (record) => {
    this.setState({ dataSource: this.state.dataSource.filter(e => e !== record) }, this.doUpdate)
  };

  componentDidMount() {
    // 初始化完成时触发一次数据更新
    this.doUpdate(false);
  };

  componentWillReceiveProps(nextProps, nextContent) {
    /**
     * 上层props.dataSource变化时，当前表格无变动且表格为空时可接收props数据
     * 作用：即对props变化保持敏感, 又防止出现dataSource地址相同时产生的问题
     */
    if (!this.changed && (!this.state.dataSource || this.state.dataSource.length == 0)) {
      let dataSource = nextProps.dataSource && (Array.isArray(nextProps.dataSource) && nextProps.dataSource || [nextProps.dataSource]) || [{}]
      this.state.dataSource = map(dataSource, item => ({ ...item }));
      this.doUpdate(false);
    }
  }

  columns = (() => {
    var merge = [];
    for (var i in this.columnsInfo) {
      var columnItem = this.columnsInfo[i];
      const { title, key } = columnItem;
      var render = record => {
        return <Input placeholder={`请填写${title}`} value={record[key]}
                      onChange={(e) => this.onChange(e, record, key)} disabled={record.disabled}/>
      };
      merge.push({
        ...columnItem,
        render
      });
    }
    merge.push({
      title: '',
      key: 'action',
      width: 60,
      align: 'right',
      render: record => {
        return record.disabled ? null : <a onClick={(e) => this.del(record)}>删除</a>
      }
    });
    return merge;
  })();

  render() {
    let rowKey = 0;
    this.onRender();
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
        <div style={{ marginTop: 20 }}></div>
        <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
          <Icon type="plus"/>{this.tableInfo.btnLabel}
        </Button>
      </div>
    )
  }
}

export default Form.create()(DynamicTableForm)
