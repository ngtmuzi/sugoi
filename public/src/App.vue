<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col-sm-3 text-center" id="left">
          <h3>配置层
            <a class="btn btn-sm btn-success" data-toggle="modal" data-target="#modal-addLayer"
               v-show="allowEditLayer">✚添加</a>
          </h3>

          <input id="allowEditLayer" type="checkbox" v-model="allowEditLayer">
          <label for="allowEditLayer">允许编辑配置层</label>

          <hr>

          <div class="list-group">
            <draggable v-model="configLayers" @start="drag=true" @end="drag=false"
                       :options="{disabled:!allowEditLayer}">

              <transition-group>
                <a class="list-group-item" href="javascript:void(0)"
                   v-for="layer in configLayers"
                   :class="{active:nowLayer===layer}" :key="layer"
                   @click="nowLayer=layer">
                  {{layer.name}}<{{ layer.desc }}>

                  <button type="button" class="close" v-show="allowEditLayer" @click="delLayer(layer)">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </a>
              </transition-group>
            </draggable>
          </div>

          <hr>
          <button class="btn btn-info" data-toggle="modal" data-target="#modal-preview">配置预览</button>

          <button class="btn btn-warning" @click="syncConfig()">同步到服务器</button>
        </div>

        <div class="col-sm-9" v-if="nowLayer">
          <h3>
            {{nowLayer.name}}<{{nowLayer.desc}}>配置项
            <a class="btn btn-sm btn-success" data-toggle="modal" data-target="#modal-addItem">✚添加</a>
          </h3>
          <div v-for="(item, key) in nowLayer.items" :key="item">
            <div class="panel panel-default">
              <div class="panel-heading">
                <a class="panel-title" role="button" data-toggle="collapse" :href="'#'+key">
                  {{key}}              <{{ item.desc }}>
                </a>
                <button type="button" class="close" @click="delItem(key)">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="panel-collapse collapse in" :id="key">
                <div class="panel-body">
                  <editor :id="'e' + key" :content="item.config" @change="previewConfig()"></editor>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--添加配置层弹窗-->
    <div id="modal-addLayer" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">添加配置层</h4>
          </div>
          <div class="modal-body">
            <form class="form-horizontal" @submit.prevent @keyup.enter="addLayer()">
              <div class="form-group">
                <label class="col-sm-3 control-label">名称</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" v-model.number="modal.addLayer.name">
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-3 control-label">描述</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" v-model.trim="modal.addLayer.desc">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="addLayer()">确认</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->

    <!--添加配置项弹窗-->
    <div id="modal-addItem" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">添加配置项</h4>
          </div>
          <div class="modal-body">
            <form class="form-horizontal" @submit.prevent @keyup.enter="addItem()">
              <div class="form-group">
                <label class="col-sm-3 control-label">名称</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" v-model.number="modal.addItem.name">
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-3 control-label">描述</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" v-model.trim="modal.addItem.desc">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="addItem()">确认</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->


    <!--配置预览弹窗-->
    <div id="modal-preview" class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">配置预览</h4>
          </div>
          <div class="modal-body">
            <form class="form-horizontal">
              <div class="form-group" v-for="layer in configLayers">
                <label class="col-sm-3 control-label">{{layer.name}}<{{layer.desc}}></label>
                <div class="col-sm-8">
                  <select class="form-control" v-model="modal.preview[layer.name]" @change="previewConfig()">
                    <option :value="undefined">未选择</option>
                    <option v-for="(item,key) in layer.items" :value="key">{{key}}<{{item.desc}}></option>
                  </select>
                </div>
              </div>
            </form>
            <hr>
            <pre>{{previewCode}}</pre>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->


  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  import editor from './editor.vue'
  import lodash from 'lodash'

  function getConfigByPath(layers = [], paths = []) {
    let l          = 0;
    let matchItems = [];
    let result     = {};

    for (let p = 0; p < paths.length; p++) {
      while (l < layers.length) {
        let _config = lodash.get(layers, [l++, 'items', paths[p], 'config']);

        if (lodash.isPlainObject(_config)) {
          matchItems.push(paths[p]);
          lodash.mergeWith(result, _config, mergeFn);
          break;
        }
      }
    }
    return result;
  }

  function mergeFn(target, source) {
    if (lodash.isArray(target) || lodash.isArray(source)) {  //不合并数组，直接覆盖
      return source;
    }
  }

  export default {
    name   : 'app',
    data () {
      return {
        nowLayer      : null,
        allowEditLayer: false,
        previewCode   : {},
        modal         : {addLayer: {}, addItem: {}, preview: {}},
        configLayers  : [
          {
            name : 'project',
            desc : '项目',
            items: {
              wnt: {
                desc  : 'WNT!',
                config: {a: 1}
              }
            }
          },

          {
            name : 'env',
            desc : '环境',
            items: {
              production: {
                desc  : '生产环境',
                config: {}
              },
              test      : {
                desc  : '测试环境',
                config: {b: 1}
              }
            }
          },

          {
            name : 'cluster',
            desc : '集群',
            items: {
              wnt1: {
                desc  : 'wnt1!',
                config: {wntCode: 'wnt1'}
              }
            }
          },

          {
            name : 'module',
            desc : '模块',
            items: {
              ping: {
                config: {c: 1}
              }
            }
          }
        ]
      }
    },
    methods: {
      previewConfig(){
        const paths      = this.configLayers.map(layer => this.modal.preview[layer.name]).filter(Boolean);
        this.previewCode = getConfigByPath(this.configLayers, paths);
      },

      syncConfig(){
        askDlg().then(() => {
          request('/saveWebConfig', 'post', {configLayers: this.configLayers})
            .then(console.log, console.error);
        }, $.noop);
      },

      addLayer(){
        if (!(this.modal.addLayer.name && this.modal.addLayer.desc)) return alert('请完整填写表单');

        this.configLayers.push({
          name : this.modal.addLayer.name,
          desc : this.modal.addLayer.desc,
          items: {}
        });
        $(`#modal-addLayer`).modal('hide');
      },

      addItem(){
        if (!(this.modal.addItem.name && this.modal.addItem.desc)) return alert('请完整填写表单');
        if (this.nowLayer.items[this.modal.addItem.name]) return alert('已存在的配置项，请使用编辑功能');

        this.$set(this.nowLayer.items, this.modal.addItem.name, {
          desc  : this.modal.addItem.desc,
          config: {}
        });
        $(`#modal-addItem`).modal('hide');
      },

      delLayer(layer){
        if (this.configLayers.indexOf(layer) < 0) return alert('未找到该配置层: ' + layer);

        askDlg().then(() => {
          this.configLayers.splice(this.configLayers.indexOf(layer), 1);
        }, $.noop);
      },

      delItem(key){
        if (!this.nowLayer.items[key]) return alert('未找到该配置项: ' + key);

        askDlg().then(() => {
          this.$delete(this.nowLayer.items, key);
        }, $.noop);
      }
    },
    mounted(){
      this.nowLayer = this.configLayers[0];
    },

    components: {draggable, editor}
  }
</script>

<style>
  #left {
    border-style: solid;
    border-width: 0;
    border-right-width: 1px;
    border-right-color: #dddddd;
  }
</style>