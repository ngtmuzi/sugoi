<template>
  <div v-if="readOnly" class="row">
    <div class="col-sm-12">
      <pre :id="id" :style="{height:showHeight}"></pre>
    </div>
  </div>

  <div v-else="readOnly" class="row">
    <div class="col-sm-10">
      <pre :id="id" :style="{height:showHeight}"></pre>
    </div>
    <div class="col-sm-2">
      <button class="btn btn-success" @click="save()">保存</button>
    </div>
  </div>
</template>

<script>
  function override(target, source) {
    Object.keys(target).forEach(function (key) {
      if (!source.hasOwnProperty(key)) delete target[key];
    });
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });
    return target;
  }

  export default {
    data(){
      return {editor: null, showHeight: '100px'};
    },
    name   : 'editor',
    props  : {id: String, content: Object, readOnly: Boolean},
    methods: {
      save(){
        try {
          const obj = JSON.parse(this.editor.getValue());
          override(this.content, obj);
          this.$emit('change');
        } catch (err) {
          alert(err.message);
        }
      },
      refresh(){
        this.editor.setValue(JSON.stringify(this.content, null, 2), -1);
        this.redraw();
      },
      redraw(){
        this.showHeight = this.editor.session.getDocument().getLength() * 15 + 'px';
        //等待dom重绘

        this.$nextTick(() => this.editor.resize());
      }
    },
    mounted(){
      this.editor = ace.edit(this.id);
      this.editor.setTheme("ace/theme/github");
      this.editor.session.setMode("ace/mode/json");
      this.editor.setReadOnly(this.readOnly);
      this.editor.on('change', () => this.redraw());
      this.refresh();
    },
    beforeDestroy(){
      this.editor.destroy();
    },
    watch  : {
      content: 'refresh'
    }
  }
</script>

<style>
  pre {
    min-height: 100px;
    max-height: 420px;
  }
</style>