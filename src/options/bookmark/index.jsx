import React from "react";
import ReactDragListView from "react-drag-listview";
import styles from "./index.styles";

const initialBookmarks = [
  {title: "Home", href: "https://"},
  {title: "Who's on Leave", href: "https://"},
  {title: "Leave", href: "https://"},
  {title: "Email", href: "https://"},
  {title: "Vocation Days", href: "https://"}
];

export default class Bookmark extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarks: initialBookmarks,
      draggable: "#drag",
      modifyIndex: null,
      menu: null,
      firstTime: true,
      info: null,
    };
  }

  componentDidMount() {
    chrome.storage.sync.get(null, (items) => {
      const {options, popup} = items
      if (options && options.firstTime === false) {
        console.log('First time loading')
        this.setState({firstTime: false, bookmarks: options.bookmarks})
      } else {
        console.log('Not first time')
        this.setState({bookmarks: initialBookmarks})
      }
    });
  }

  getStorageData = () => {
  }

  setBookmarks = (bookmarks) => this.setState({bookmarks})

  setDraggable = (para) => this.setState({draggable: para})

  setDragProps = () => {
    const {bookmarks, draggable} = this.state
    const setBookmarks = this.setBookmarks;
    this.dragProps = {
      onDragEnd(fromIndex, toIndex) {
        const newBookmarks = bookmarks;
        const item = newBookmarks.splice(fromIndex, 1)[0];
        newBookmarks.splice(toIndex, 0, item);
        setBookmarks(newBookmarks);
      },
      nodeSelector: "#item",
      handleSelector: draggable
    };
  };

  deleteItem = (index) => {
    const tempData = this.state.bookmarks;
    tempData.splice(index, 1);
    this.setBookmarks(tempData);
  };

  addItem = (name, url) => {
    const item = {title: name, href: url};
    const tempData = this.state.bookmarks;
    tempData.push(item);
    this.setBookmarks(tempData);
  };

  onModify = (index) => {
    this.setState({modifyIndex: index});
    this.setDraggable("false");
  };

  saveItem = (index, name, url) => {
    const item = {title: name, href: url};
    const tempData = this.state.bookmarks;
    tempData.splice(index, 1, item);
    this.setBookmarks(tempData);
    this.setDraggable("#drag");
    this.setState({modifyIndex: null})
  };

  setMenu = (para) => this.setState({menu: para});

  saveChange = () => {
    this.setState({info: "save....."})
    window.scrollTo(0, 0);
    const {bookmarks} = this.state
    chrome.storage.sync.set({
      options: {
        bookmarks: bookmarks,
        firstTime: false
      }
    }, () => {
      setTimeout(() => this.setState({info: null}), 1000)
      console.log('Set chrome storage sucess.')
    })
  }

  render() {
    this.setDragProps();
    const {modifyIndex, menu, bookmarks, info} = this.state;
    return (
      <div style={styles.containers}>
        {info && <div style={styles.info}>{info}</div>}
        {menu === null && modifyIndex === null && (
          <div style={styles.inputContainer}>
            <div onClick={() => this.saveChange()} style={styles.button}>
              Save
            </div>
            <div onClick={() => this.setMenu("add")} style={styles.button}>
              Add
            </div>
          </div>
        )}
        {menu === "add" && (
          <div style={{...styles.inputContainer, flexDirection: "column"}}>
            <input style={styles.input} placeholder="name" ref={(r) => (this.saveName = r)} />
            <input style={styles.input} placeholder="url" ref={(r) => (this.saveHref = r)} />
            <div style={styles.buttons}>
              <div style={styles.button} onClick={() => this.addItem(this.saveName.value, this.saveHref.value)}>
                Add
              </div>
              <div onClick={() => this.setMenu(null)} style={styles.button}>
                Cancel
              </div>
            </div>
          </div>
        )}
        <ReactDragListView {...this.dragProps}>
          {bookmarks.map((item, index) => (
            <div style={styles.container} id="item" key={index}>
              <div style={styles.title}>
                {index + 1}. {item.title}
                {modifyIndex === index && <input style={styles.input} defaultValue={item.title} ref={(r) => (this.name = r)} />}
              </div>
              <div>
                <a style={styles.link} href={item.href}>
                  {item.href}
                </a>
                {modifyIndex === index && <input style={styles.input} defaultValue={item.href} ref={(r) => (this.href = r)} />}
              </div>
              <div style={styles.buttons}>
                {modifyIndex !== index && <div style={styles.button} onClick={() => this.onModify(index)}>
                  modify
                </div>}
                {modifyIndex !== index && <div style={styles.button} onClick={() => this.deleteItem(index)}>
                  Delete
                </div>}
                {modifyIndex === index &&
                  <div style={styles.button} onClick={() => this.saveItem(index, this.name.value, this.href.value)}>
                    Save
                  </div>}
              </div>
              <div style={styles.drag} id="drag">
                ☰
              </div>
            </div>
          ))}
        </ReactDragListView>
      </div>
    );
  }
}
