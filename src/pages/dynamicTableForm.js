import styles from './index.css';
import DynamicTableForm from '../component/DynamicTableForm'
import React from "react";

export default class DynamicTableFormComponent extends React.Component {
  state = { dataSource: [{ name: 'imbugs', age: '1' }, { name: 'alipay', age: '10' }] };

  refresh = () => {
    let lineCount = Math.max(1, Math.ceil(Math.random() * 5));
    let dataSource = [];
    for (let idx = 0; idx < lineCount; idx++) {
      dataSource.push({ name: Math.random().toString(36).substr(2), age: Math.ceil(Math.random() * 50) })
    }
    console.log("refresh dataSource = ", dataSource);
    this.setState({ dataSource, refreshKey: Math.random().toString(36).substr(2) })
  }

  onChangeValues = (values) => {
    let nameMap = new Map();
    for (let i in values) {
      let name = values[i].name;
      if (name) {
        if (nameMap.has(name)) {
          console.log(`onChange name信息重复 ${name}`)
          return { errorMsg: `姓名信息重复: ${name}`, fields: { name: { records: [values[i], nameMap.get(name)] } } }
        }
        nameMap.set(name, values[i]);
      }
    }
    console.log('onChange = ', values)
    this.setState({ dataSource: values });
  };

  columnsInfo = [{
    title: '姓名',
    key: 'name'
  }, {
    title: 'Age',
    key: 'age'
  }]

  render() {
    const props = this.props;
    console.log('render dataSource = ', this.state.dataSource)
    return (
      <div className={styles.normal}>
        <input type="button" value="重新挂载表格" style={{ marginBottom: 10 }} onClick={this.refresh} />
        <DynamicTableForm {...props}
          // 设置key可控制table的重新挂载
          key={`key_${this.state.refreshKey}`}
          columnsInfo={this.columnsInfo}
          tableInfo={{ btnLabel: '添加一行' }}
          dataSource={this.state.dataSource}
          onChange={this.onChangeValues}
          validator={{
            age: {
              type: "string",
              require: true,
              pattern: /^[0-9]{1,}$/,
              message: "年龄必须是数字"
            }
          }}
          onRender={(dataSource) => {
            if (!dataSource || dataSource.length == 0) {
              return;
            }
            // 添加other分类且排序
            if (!dataSource.find(item => item.name == 'other')) {
              // classify下没有other时添加一个
              dataSource.push({ name: 'other', age: 0 });
            }

            let onlyOne = true;
            dataSource.forEach((item) => {
              item.disabled = onlyOne && item.name == 'other';
              if (item.disabled) {
                // 第二个other不再锁定
                onlyOne = false;
              }
            });
            // 将disabled排到最前面
            dataSource.sort((a, b) => {
              return a.disabled ? -1 : b.disabled ? 1 : 0;
            });
          }} />
      </div>
    );
  }

}
