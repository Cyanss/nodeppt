
// Meta class

/**
 * class Meta
 **/

/**
 * new Meta(type, tag)
 *
 * Create new meta and fill passed properties.
 **/
function Meta (type, tag) {
  /**
   * Meta#type -> String
   *
   * Type of the meta (string, e.g. "gallery")
   **/
  this.type     = type

  /**
   * Meta#tag -> String
   *
   * html tag name type open or close
   **/
  this.tag      = tag

  /**
   * Meta#handle -> Boolean
   *
   * True for handle-level metas, false for inline metas.
   * Used in handler 
   **/
  this.handle    = false

  /**
   * Meta#attrs -> Array
   *
   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
   **/
  this.attrs    = null

}


/**
 * Meta.attrIndex(name) -> Number
 *
 * Search attribute index by name.
 **/
Meta.prototype.attrIndex = function attrIndex (name) {
  if (!this.attrs) { return -1 }

  const attrs = this.attrs

  for (let i = 0, len = attrs.length; i < len; i++) {
    if (attrs[i][0] === name) { return i }
  }
  return -1
}

/**
 * Meta.attrPush(attrData)
 *
 * Add `[ name, value ]` attribute to list. Init attrs if necessary
 **/
Meta.prototype.attrPush = function attrPush (attrData) {
  if (this.attrs) {
    this.attrs.push(attrData)
  } else {
    this.attrs = [attrData]
  }
}

/**
 * Meta.attrSet(name, value)
 *
 * Set `name` attribute to `value`. Override old value if exists.
 **/
Meta.prototype.attrSet = function attrSet (name, value) {
  const idx = this.attrIndex(name)
  const attrData = [name, value]

  if (idx < 0) {
    this.attrPush(attrData)
  } else {
    this.attrs[idx] = attrData
  }
}

/**
 * Meta.attrGet(name)
 *
 * Get the value of attribute `name`, or null if it does not exist.
 **/
Meta.prototype.attrGet = function attrGet (name) {
  const idx = this.attrIndex(name)
  let value = null
  if (idx >= 0) {
    value = this.attrs[idx][1]
  }
  return value
}

/**
 * Meta.attrJoin(name, value)
 *
 * Join value to existing attribute via space. Or create new attribute if not
 * exists. Useful to operate with meta classes.
 **/
Meta.prototype.attrJoin = function attrJoin (name, value) {
  const idx = this.attrIndex(name)

  if (idx < 0) {
    this.attrPush([name, value])
  } else {
    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value
  }
}
module.exports = exports = Meta
