/* Trigon Al Aliah Core: edit-screen behaviour (media pickers, ordering, repeaters). No build step. */
( function () {
	'use strict';

	var counter = 0;
	function uid() {
		counter += 1;
		return 'n' + Date.now().toString( 36 ) + counter;
	}

	function thumbHtml( att ) {
		var url = att.sizes && att.sizes.thumbnail ? att.sizes.thumbnail.url : att.url;
		var img = document.createElement( 'img' );
		img.src = url;
		img.alt = '';
		img.width = 75;
		img.height = 75;
		return img;
	}

	function controls() {
		var span = document.createElement( 'span' );
		span.className = 'aa-item-controls';
		span.innerHTML =
			'<button type="button" class="button-link aa-move" data-dir="-1" aria-label="Move earlier">↑</button>' +
			'<button type="button" class="button-link aa-move" data-dir="1" aria-label="Move later">↓</button>' +
			'<button type="button" class="button-link aa-remove" aria-label="Remove">×</button>';
		return span;
	}

	function frame( opts ) {
		return window.wp.media( {
			title: opts.title,
			multiple: opts.multiple,
			library: { type: opts.type || 'image' },
			button: { text: opts.button || 'Use selected' },
		} );
	}

	document.addEventListener( 'click', function ( e ) {
		var t = e.target;

		// Single image or file.
		if ( t.classList.contains( 'aa-media-choose' ) ) {
			var box = t.closest( '.aa-media' );
			var type = box.getAttribute( 'data-aa-type' );
			var f = frame( { title: 'Choose file', multiple: false, type: type } );
			f.on( 'select', function () {
				var att = f.state().get( 'selection' ).first().toJSON();
				box.querySelector( '.aa-media-value' ).value = att.id;
				var prev = box.querySelector( '.aa-media-preview' );
				prev.textContent = '';
				prev.appendChild( type === 'image' ? thumbHtml( att ) : document.createTextNode( att.filename ) );
				box.querySelector( '.aa-media-clear' ).hidden = false;
				t.textContent = 'Replace';
			} );
			f.open();
		}
		if ( t.classList.contains( 'aa-media-clear' ) ) {
			var b = t.closest( '.aa-media' );
			b.querySelector( '.aa-media-value' ).value = '';
			b.querySelector( '.aa-media-preview' ).textContent = '';
			t.hidden = true;
		}

		// Gallery.
		if ( t.classList.contains( 'aa-gallery-add' ) ) {
			var g = t.closest( '.aa-media' );
			var gf = frame( { title: 'Add images', multiple: 'add' } );
			gf.on( 'select', function () {
				var list = g.querySelector( '.aa-sortable' );
				gf.state().get( 'selection' ).each( function ( m ) {
					var att = m.toJSON();
					var li = document.createElement( 'li' );
					li.className = 'aa-item';
					li.draggable = true;
					var input = document.createElement( 'input' );
					input.type = 'hidden';
					input.name = g.getAttribute( 'data-aa-name' ) + '[]';
					input.value = att.id;
					li.appendChild( input );
					li.appendChild( thumbHtml( att ) );
					li.appendChild( controls() );
					list.appendChild( li );
				} );
			} );
			gf.open();
		}

		// Floor plans: an image is all that is needed.
		if ( t.classList.contains( 'aa-plans-add' ) ) {
			var p = t.closest( '.aa-media' );
			var pf = frame( { title: 'Add floor plans', multiple: 'add' } );
			pf.on( 'select', function () {
				var list = p.querySelector( '.aa-plans' );
				var tpl = p.querySelector( '.aa-plan-template' ).innerHTML;
				pf.state().get( 'selection' ).each( function ( m ) {
					var att = m.toJSON();
					var wrap = document.createElement( 'div' );
					wrap.innerHTML = tpl.split( '__i__' ).join( uid() );
					var li = wrap.firstElementChild;
					li.querySelector( '.aa-plan-id' ).value = att.id;
					li.querySelector( '.aa-plan-thumb' ).appendChild( thumbHtml( att ) );
					list.appendChild( li );
				} );
			} );
			pf.open();
		}

		// Ordering and removal (keyboard-accessible alternative to drag and drop).
		if ( t.classList.contains( 'aa-move' ) ) {
			var item = t.closest( '.aa-item' );
			if ( t.getAttribute( 'data-dir' ) === '-1' && item.previousElementSibling ) {
				item.parentNode.insertBefore( item, item.previousElementSibling );
			} else if ( t.getAttribute( 'data-dir' ) === '1' && item.nextElementSibling ) {
				item.parentNode.insertBefore( item.nextElementSibling, item );
			}
			t.focus();
		}
		if ( t.classList.contains( 'aa-remove' ) ) {
			t.closest( '.aa-item' ).remove();
		}

		// Repeaters (permits, sources).
		if ( t.classList.contains( 'aa-row-add' ) ) {
			var rep = t.closest( '.aa-repeater' );
			var wrapper = document.createElement( 'div' );
			wrapper.innerHTML = rep.querySelector( 'template' ).innerHTML.split( '__i__' ).join( uid() );
			var row = wrapper.firstElementChild;
			rep.querySelector( '.aa-rows' ).appendChild( row );
			var first = row.querySelector( 'input,select' );
			if ( first ) {
				first.focus();
			}
		}
		if ( t.classList.contains( 'aa-row-remove' ) ) {
			t.closest( '.aa-row' ).remove();
		}
	} );

	// Drag and drop ordering.
	var dragged = null;
	document.addEventListener( 'dragstart', function ( e ) {
		if ( e.target.classList && e.target.classList.contains( 'aa-item' ) ) {
			dragged = e.target;
			e.dataTransfer.effectAllowed = 'move';
		}
	} );
	document.addEventListener( 'dragover', function ( e ) {
		var over = e.target.closest && e.target.closest( '.aa-item' );
		if ( dragged && over && over !== dragged && over.parentNode === dragged.parentNode ) {
			e.preventDefault();
			var rect = over.getBoundingClientRect();
			var after = ( e.clientX - rect.left ) > rect.width / 2;
			over.parentNode.insertBefore( dragged, after ? over.nextSibling : over );
		}
	} );
	document.addEventListener( 'dragend', function () {
		dragged = null;
	} );

	// A property's developer comes from its project when one is chosen.
	document.addEventListener( 'change', function ( e ) {
		if ( e.target.getAttribute && e.target.getAttribute( 'data-aa-post' ) === 'aa_project_id' ) {
			var dev = document.querySelector( '[data-aa-post="aa_developer_id"]' );
			if ( dev && document.body.classList.contains( 'post-type-alaliah_property' ) ) {
				dev.disabled = !! e.target.value;
			}
		}
	} );
} )();
