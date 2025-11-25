/**
 * Tree data structures for route categorization and hierarchical selection
 */

/**
 * Options for TreeNode configuration
 */
export interface TreeNodeOptions {
  [key: string]: any
}

/**
 * Configuration for creating a TreeNode
 */
export interface TreeNodeConfig {
  key?: string
  name?: string
  desc?: string
  opts?: TreeNodeOptions
  deps?: unknown[]
  children?: Record<string, TreeNodeConfig>
}

/**
 * Hierarchical tree structure with selection state management
 * Used for route categorization and filtering
 */
export class TreeNode {
  key: string
  name?: string
  desc?: string
  selected: boolean
  indet: boolean
  opts: TreeNodeOptions
  deps: unknown[]
  children: Record<string, TreeNode>

  constructor (n?: TreeNodeConfig) {
    n = n || {}
    this.key = n.key || '*'
    this.name = n.name
    this.desc = n.desc
    this.selected = false
    this.indet = false
    this.opts = n.opts || {}
    this.deps = []
    if (n.deps) {
      this.deps = n.deps
    }
    this.children = {}
    if (n.children) {
      const c: Record<string, TreeNode> = {}
      for (const [k, v] of Object.entries(n.children)) {
        c[k] = new TreeNode(v)
      }
      this.children = c
    }
  }

  /**
   * Get dependencies of all selected leaf nodes
   */
  getSelectedDeps (): unknown[] {
    const ret: unknown[] = []
    if (this.selected && Object.keys(this.children).length === 0) {
      for (const dep of this.deps) {
        ret.push(dep)
      }
    }
    for (const v of Object.values(this.children)) {
      for (const d of v.getSelectedDeps()) {
        ret.push(d)
      }
    }
    return ret
  }

  /**
   * Toggle selection state for specific keys
   */
  toggleUnselected (state: boolean, ...keys: string[]): this {
    for (const key of keys) {
      if (state) {
        this.selectKey(key)
      } else {
        this.unselectKey(key)
      }
    }
    this.setIndet()
    return this
  }

  /**
   * Select all nodes matching the given key
   */
  selectKey (key: string): void {
    if (this.key === key || key === '*') {
      this.selectAll()
    }
    for (const v of Object.values(this.children)) {
      v.selectKey(key)
    }
  }

  /**
   * Unselect all nodes matching the given key
   */
  unselectKey (key: string): void {
    if (this.key === key || key === '*') {
      this.unselectAll()
    }
    for (const v of Object.values(this.children)) {
      v.unselectKey(key)
    }
  }

  /**
   * Select this node and all children
   */
  selectAll (): this {
    for (const v of Object.values(this.children)) {
      v.selectAll()
    }
    this.selected = true
    this.indet = false
    return this
  }

  /**
   * Unselect this node and all children
   */
  unselectAll (): this {
    for (const v of Object.values(this.children)) {
      v.unselectAll()
    }
    this.selected = false
    this.indet = false
    return this
  }

  /**
   * Get list of unselected node keys
   */
  getExcludeList (): string[] {
    let ret: string[] = []
    if (!this.selected && !this.indet) {
      ret.push(this.key)
    } else {
      for (const v of Object.values(this.children)) {
        ret = ret.concat(v.getExcludeList())
      }
    }
    return ret
  }

  /**
   * Traverse the tree and execute callback for each node
   */
  traverse (cb: (node: TreeNode) => void): void {
    cb(this)
    for (const v of Object.values(this.children)) {
      v.traverse(cb)
    }
  }

  /**
   * Get selection statistics
   */
  getSel (): { sel: number, unsel: number } {
    let sel = 0
    let unsel = 0
    this.traverse((n) => {
      if (n.selected) {
        sel += 1
      } else {
        unsel += 1
      }
    })
    return { sel, unsel }
  }

  /**
   * Mark nodes as unselected based on a list of keys
   */
  setUnselected (unselected: string[]): this {
    for (const s of unselected) {
      if (this.key === s) {
        this.unselectAll()
      }
    }
    for (const v of Object.values(this.children)) {
      v.setUnselected(unselected)
    }
    return this
  }

  /**
   * Update indeterminate state based on children's selection
   */
  setIndet (): this {
    for (const v of Object.values(this.children)) {
      v.setIndet()
    }
    let sel = 0
    let unsel = 0
    this.traverse((n) => {
      if (n.selected) {
        sel += 1
      } else {
        unsel += 1
      }
    })
    if (unsel === 0 && sel > 0) {
      this.selected = true
      this.indet = false
    } else if (unsel > 0 && sel > 0) {
      this.selected = false
      this.indet = true
    } else if (sel === 0) {
      this.selected = false
      this.indet = false
    }
    return this
  }
}
