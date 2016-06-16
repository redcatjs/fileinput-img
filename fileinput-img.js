//based on http://jasny.github.com/bootstrap
(function(){
	var vcenter = '<span class="vertical-centerer"></span>';
	var isIE = window.navigator.appName == 'Microsoft Internet Explorer';
	var Fileinput = function (element, options) {
		this.$element = $(element);
		this.$input = this.$element.find(':file');
		if (this.$input.length === 0) return;
		this.name = this.$input.attr('name');
		this.$preview = this.$element.find('.fileinput-preview');
		this.$remove = this.$element.find('input[type="hidden"][name="'+this.name+'_remove"]');
		
		this.$preset = options.preset?'<img src="'+options.preset+'">':'';
		this.$presetOrigin = this.$preset;
		if(this.$presetOrigin){
			this.$element.find('[data-remove="fileinput"]').show();
			this.$preview.append(this.$preset);
		}
		
		var height = this.$preview.css('height');
		this.original = {
			exists: this.$element.hasClass('fileinput-exists'),
			preview: this.$preview.html()
		};		
		this.listen();
	};
	Fileinput.prototype.listen = function() {
		this.$input.on('change.bs.fileinput-img', $.proxy(this.change, this));
		$(this.$input[0].form).on('reset.bs.fileinput-img', $.proxy(this.reset, this));
		this.$element.find('[data-trigger="fileinput"]').on('click.bs.fileinput-img', $.proxy(this.trigger, this));
		this.$element.find('[data-dismiss="fileinput"]').on('click.bs.fileinput-img', $.proxy(this.clear, this));
		this.$element.find('[data-remove="fileinput"]').on('click.bs.fileinput-img', $.proxy(this.remove, this));
		this.$element.find('[data-restore="fileinput"]').on('click.bs.fileinput-img', $.proxy(this.restore, this));
	};
	Fileinput.prototype.change = function(e) {
		//console.log('change');
		var files = e.target.files === undefined ? (e.target && e.target.value ? [{ name: e.target.value.replace(/^.+\\/, '')}] : []) : e.target.files
		e.stopPropagation();
		if (files.length === 0) {
			this.clear();
			return;
		}
		this.$input.attr('name', this.name);
		var file = files[0];
		if (this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match(/^image\/(gif|png|jpeg|svg\+xml)$/) : file.name.match(/\.(gif|png|svg|jpe?g)$/i)) && typeof FileReader !== "undefined") {
			var reader = new FileReader();
			var preview = this.$preview;
			var element = this.$element;
			reader.onload = function(re) {
				var $img = $('<img>');
				$img[0].src = re.target.result;
				files[0].result = re.target.result;
				element.find('.fileinput-filename').text(file.name);
				// if parent has max-height, using `(max-)height: 100%` on child doesn't take padding and border into account
				if (preview.css('max-height') != 'none')
					$img.css('max-height', parseInt(preview.css('max-height'), 10) - parseInt(preview.css('padding-top'), 10) - parseInt(preview.css('padding-bottom'), 10)	- parseInt(preview.css('border-top'), 10) - parseInt(preview.css('border-bottom'), 10));
				preview.html($img);
				preview.prepend(vcenter); //surikat addon
				element.addClass('fileinput-exists').removeClass('fileinput-new');
				element.trigger('change.bs.fileinput-img', files);
			}
			reader.readAsDataURL(file);
			this.$element.find('[data-dismiss="fileinput"]').show();
			this.$element.find('[data-remove="fileinput"]').hide();
			this.$remove.val('');
			this.$element.find('[data-restore="fileinput"]').hide();
		} else {
			this.$element.find('.fileinput-filename').text(file.name);
			this.$preview.text(file.name);
			this.$element.addClass('fileinput-exists').removeClass('fileinput-new');	
			this.$element.trigger('change.bs.fileinput-img');
		}
	};
	Fileinput.prototype.clear = function(e) {
		//console.log('clear');
		if (e)
			e.preventDefault();
		this.$input.attr('name', '');
		//ie8+ doesn't support changing the value of input with type=file so clone instead
		if (isIE) { 
			var inputClone = this.$input.clone(true);
			this.$input.after(inputClone);
			this.$input.remove();
			this.$input = inputClone;
		} else {
			this.$input.val('');
		}
		this.$preview.html(vcenter+this.$preset);
		this.$element.find('.fileinput-filename').text('');
		this.$element.addClass('fileinput-new').removeClass('fileinput-exists');
		if(e)
			this.$input.trigger('change');
		if (e!==false)
			this.$element.trigger('clear.bs.fileinput-img');	
		this.$element.find('[data-dismiss="fileinput"]').hide();
		if(this.$presetOrigin){
			this.$element.find('[data-remove="fileinput"]').show();
		}
	};
	
	Fileinput.prototype.remove = function(e) {
		//console.log('remove');
		this.$preset = '';
		this.clear();
		this.$remove.val('1');
		this.$element.find('[data-remove="fileinput"]').hide();
		this.$element.find('[data-restore="fileinput"]').show();
	};
	Fileinput.prototype.restore = function(e) {
		//console.log('restore');
		this.$preset = this.$presetOrigin;
		this.clear();
		this.$remove.val('');
		this.$element.find('[data-restore="fileinput"]').hide();
		this.$element.find('[data-remove="fileinput"]').show();
	};
	
	Fileinput.prototype.reset = function() {
		//console.log('reset');
		this.clear(false);

		this.$preview.html(this.original.preview);
		this.$element.find('.fileinput-filename').text('');

		if (this.original.exists) this.$element.addClass('fileinput-exists').removeClass('fileinput-new');
		 else this.$element.addClass('fileinput-new').removeClass('fileinput-exists');
		
		this.$element.trigger('reset.bs.fileinput-img');
	};
	Fileinput.prototype.trigger = function(e) {
		this.$input.trigger('click');
		e.preventDefault();
	};
	$.fn.fileinputImg = function (options) {
		return this.each(function(){
			
			var $this = $(this);
			var name = $this.attr('name');	
			var preset = $this.attr('data-src');	
			var opts;
			if(typeof(options)=='undefined'){
				options = {};
			}
			if(typeof(options)=='object'){
				opts = $.clone(options);
				if(preset){
					opts.preset = preset;
				}
			}
			$this
				.wrap('<div class="fileinput fileinput-exists"></div>')
				.after(
					'<span class="fileinput-preview thumbnail" style="width: 200px; height: 150px;" data-trigger="fileinput"><span class="vertical-centerer"></span></span>'
					+'<span class="fileinput-filename" data-trigger="fileinput"></span>'
					+'<span data-dismiss="fileinput"></span>'			
					+'<span data-remove="fileinput"></span>'			
					+'<span data-restore="fileinput"></span>'
					+'<input type="hidden" name="'+name+'_remove">'
				)
			;
			var fi = $this.parent();
			var data = fi.data('fileinput');
			if (!data) fi.data('fileinput', (data = new Fileinput(fi[0], opts)));
			if (typeof options == 'string') data[options]();
		})
	};
})();