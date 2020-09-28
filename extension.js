const Meta = imports.gi.Meta;

function check(act) {
  const win = act.meta_window;
  if (win.window_type !== Meta.WindowType.NORMAL)
    return;
  if (win.get_maximized() !== Meta.MaximizeFlags.BOTH)
    return;
  if (win.get_workspace().list_windows().length > 1) {
    global.workspace_manager.append_new_workspace(false, global.get_current_time());

    const wsi = win.get_workspace().index();
    const wn = global.workspace_manager.n_workspaces;
    const nws = global.workspace_manager.get_workspace_by_index(wn - 1);

    global.workspace_manager.reorder_workspace(nws, wsi);

    win
    .get_workspace()
    .list_windows()
    .filter(w => w !== win)
      .reduce((isFirst, w) => {
        w.change_workspace_by_index(wsi, isFirst);
        return false;
      }, true);
  }
}

const _handles = [];

function enable() {
  global.get_window_actors().forEach(check);
  _handles.push(global.window_manager.connect('map', (_, act) => check(act)));
  _handles.push(global.window_manager.connect('size-change', (_, act, change) => {
    if (change === Meta.SizeChange.MAXIMIZE)
      check(act);
  }));
  _handles.push(global.window_manager.connect('switch-workspace', () => {
    const acts = global.get_window_actors()
      .filter(a => a.meta_window.has_focus());
    if (acts.length)
      check(acts[0]);
  }));
}

function disable() {
  _handles.splice(0).forEach(h => global.window_manager.disconnect(h));
}
