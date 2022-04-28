import { writable } from 'svelte/store';
const action = {
  active: writable(false),
  text: writable(''),
  action: writable(''),
  show() {
    this.active.update(() => true);
    return this;
  },
  hide() {
    this.active.update(() => false);
    return this;
  },
  setText(value: string) {
    this.text.update(() => value);
    return this;
  },
  setAction(value: string) {
    this.action.update(() => value);
    return this;
  },
}
action.active.subscribe((value) => {
  if (!value) {
    action.action.set('');
  }
})
export default action;