import map from "lodash/map";
import schema from "async-validator";
import React from "react";
import { Button, Form, Icon, Input, Table } from "antd";

/**
 * 动态表单
 * @param key react的key数据, 可设置key={type}, 当type变动的时候table重新挂载，如果需要重设table可设置此项
 * @param columnsInfo 列信息
 * @param tableInfo 表信息
 * @param onChange 更新内容事件, 支持返回错误检查
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
  validator = this.props.validator && new schema(this.props.validator);

  /** 记录是否已经变化, 如果变化后props.dataSource数据不再对表格产生影响 */
  changed = false;
  state = {
    dataSource: [],
    error: false
  };


  doUpdate = (change = true) => {
    this.changed = change;
    if (this.cb) {
      let data = [];
      for (let i in this.state.dataSource) {
        if (!this.isEmptyRow(this.state.dataSource[i])) {
          data.push(this.state.dataSource[i]);
        }
      }

      // 支持更新时校验
      // error: {
      //   errorMsg: '错误信息'
      //   type: '错误级别'
      //   fields: { // 错误字段位置
      //     columnKey: { // 列信息
      //       records: [values[i], nameMap.get(name)],  // 行信息
      //     }
      //   }
      // }
      let error = this.cb(data);
      // 重置所有错误提示
      for (let idx in this.state.dataSource) {
        let record = this.state.dataSource[idx];
        record.css = {};
      }

      if (error) {
        this.setState({ error: { ...error } })
        for (let key in (error['fields'] || {})) {
          let { records } = error['fields'][key];
          (records || []).forEach(record => {
            record.css = record.css || {}
            record.css[key] = this.styles['error'];
          });
        }
      } else {
        this.setState({ error: false })
      }
    }
  };

  onRender = () => {
    if (typeof (this.props.onRender) === 'function') {
      let updateDataSource = this.props.onRender(this.state.dataSource);
      this.state.dataSource = Array.isArray(updateDataSource) ? updateDataSource : this.state.dataSource;
    }
  };

  styles = {
    error: {
      borderColor: '#ff4d4f',
      outline: 0,
      boxShadow: '0 0 0 2px rgba(245,34,45,0.2)',
      borderRightWidth: '1px !important'
    },
    warning: {
      borderColor: '#ffc53d',
      outline: 0,
      boxShadow: '0 0 0 2px rgba(250,173,20,0.2)',
      borderRightWidth: '1px !important'
    }
  };

  onChange = (e, record, field) => {
    record[field] = e.target.value;
    if (this.validator) {
      this.validator.validate(record, (errors, fields) => {
        record.css = record.css || {};
        if (errors && errors[0]) {
          for (let key in fields) {
            record.css[key] = this.styles['error'];
          }
          this.setState({ error: { errorMsg: errors[0].message } });
        } else {
          // 重置该行所有错误
          record.css = {};
          this.setState({ error: false }, this.doUpdate)
        }
      });
    } else {
      this.setState({}, this.doUpdate)
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

  add = () => {
    this.setState({ dataSource: [...this.state.dataSource, {}] }, this.doUpdate)
  };

  del = (record) => {
    this.setState({ dataSource: this.state.dataSource.filter(e => e !== record) }, this.doUpdate)
  };

  componentDidMount() {
    // 初始化完成时触发一次数据更新
    this.componentWillReceiveProps(this.props)
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
        let css = (record.css && record.css[key]) || {};
        return <Input
          placeholder={`请填写${title}`}
          value={record[key]}
          onChange={(e) => this.onChange(e, record, key)}
          disabled={record.disabled}
          style={css} />
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
        {this.state.error && this.state.error.errorMsg && <Form.Item
          help={this.state.error.errorMsg}
          validateStatus={this.state.error.type || 'error'}
          label={false}
          hasFeedback={false}
          style={{ marginTop: 10 }}
        />}
        <div style={{ marginTop: 20 }}></div>
        <Button type="dashed" onClick={this.add} style={{ width: '100%' }}>
          <Icon type="plus" />{this.tableInfo.btnLabel}
        </Button>
      </div>
    )
  }
}

export default Form.create()(DynamicTableForm)
