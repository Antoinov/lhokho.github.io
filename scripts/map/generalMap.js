const _0x35b5=['#destination_select','getBounds','update','onAdd','no\x20return','textContent','find','#tickets','length','undefined','marker','one_day','<input\x20type=\x22text\x22\x20id=\x22myInput\x22\x20onkeyup=\x22Search()\x22\x20placeholder=\x22Search\x20for\x20cities..\x22><div\x20\x20class=\x22Content\x22><ul\x20style=\x22padding:\x200;list-style-type:none;\x22\x20id=\x22tickets\x22\x20role=\x22tablist\x22\x20aria-multiselectable=\x22true\x22></ul></div>','log','lat','option[value=\x27','none','[ondbClick]\x20Enter\x20in\x20event\x20method','display\x20tickets...','display','input[name=\x27oneday_type\x27]:checked','lon','sourceTarget','dblclick','data','Browser','#selected_date','indexOf','#se-loading-function','getElementsByTagName','#destination_browser\x20[value=\x22','icon','css','cluster','#destination_browser','innerText','slice','attr','lng','val','The\x20element\x20does\x20not\x20exist','images/icons/station.png','addLayer','featureGroup','no_return','remove','city','getCenter','images/icons/placeholder.png','charAt','right','closePopup','fitBounds','clearLayers','click','FixedHeightContainer','blur','DomUtil','getElementById','Merci\x20de\x20renseigner\x20une\x20destination','options','iata_code','_div','myInput','originalEvent','On\x20part\x20d\x27où\x20?','#return_date','div','control','forEach','change','openPopup','bottomright','scrollIntoView','input[name=\x27journey_type\x27]:checked','setIcon','bindTooltip','addTo','.FixedHeightContainer','create','#search_btn','setOpacity','input[name=\x27trip\x27]:checked','input[name=\x27trip_type\x27]:checked','innerHTML','toUpperCase','style','fire','block','value','target','eachLayer'];(function(_0x36a0b5,_0x35b5a4){const _0x516c03=function(_0x18f072){while(--_0x18f072){_0x36a0b5['push'](_0x36a0b5['shift']());}};_0x516c03(++_0x35b5a4);}(_0x35b5,0x13d));const _0x516c=function(_0x36a0b5,_0x35b5a4){_0x36a0b5=_0x36a0b5-0x0;let _0x516c03=_0x35b5[_0x36a0b5];return _0x516c03;};function focus_station(_0x18f072,_0x406b97){const _0x43d10c=_0x516c;_0x406b97[_0x43d10c('0x32')](function(_0x58b9eb){const _0x111385=_0x43d10c;_0x58b9eb[_0x111385('0x13')]['id']===_0x18f072&&_0x58b9eb[_0x111385('0x2e')](_0x111385('0xd'));});}function Search(){const _0x15c740=_0x516c;var _0x36bce3,_0x3f0cf6,_0x58770d,_0x9f2879,_0x54c16f,_0x2a4372,_0x38c7f8;_0x36bce3=document[_0x15c740('0x11')](_0x15c740('0x16')),_0x3f0cf6=_0x36bce3[_0x15c740('0x30')][_0x15c740('0x2c')](),_0x58770d=document[_0x15c740('0x11')]('tickets'),_0x9f2879=_0x58770d[_0x15c740('0x50')]('li');for(_0x2a4372=0x0;_0x2a4372<_0x9f2879[_0x15c740('0x3b')];_0x2a4372++){_0x54c16f=_0x9f2879[_0x2a4372][_0x15c740('0x50')]('p')[0x0],_0x38c7f8=_0x54c16f[_0x15c740('0x38')]||_0x54c16f[_0x15c740('0x56')];_0x38c7f8['toUpperCase']()[_0x15c740('0x4e')](_0x3f0cf6)>-0x1?_0x9f2879[_0x2a4372][_0x15c740('0x2d')][_0x15c740('0x46')]='':_0x9f2879[_0x2a4372][_0x15c740('0x2d')]['display']=_0x15c740('0x43');;};}function displayTickets(_0x432d1e){const _0x44acb8=_0x516c;console[_0x44acb8('0x40')](_0x44acb8('0x45'));var _0x5dd609=L[_0x44acb8('0x1b')]({'position':_0x44acb8('0x1f')});let _0x5ac969=_0x44acb8('0x3f');_0x5dd609[_0x44acb8('0x36')]=function(){const _0x508007=_0x44acb8;return this[_0x508007('0x15')]=L[_0x508007('0x10')][_0x508007('0x26')](_0x508007('0x1a'),_0x508007('0xe')),this[_0x508007('0x35')](),this[_0x508007('0x15')];},_0x5dd609['update']=function(_0x2dab8d){const _0x58d429=_0x44acb8;this[_0x58d429('0x15')][_0x58d429('0x2b')]=_0x5ac969;},$(_0x44acb8('0x25'))[_0x44acb8('0x3b')]===0x0?_0x5dd609[_0x44acb8('0x24')](_0x432d1e):($(_0x44acb8('0x25'))[_0x44acb8('0x4')](),_0x5dd609[_0x44acb8('0x24')](_0x432d1e));}$(document)['ready'](function(){const _0x5dc269=_0x516c;function _0x40c4bb(){const _0x4cdf65=_0x516c;typeof tripLayer!=='undefined'&&tripLayer[_0x4cdf65('0xc')]();typeof localTrainLayer!=='undefined'&&localTrainLayer[_0x4cdf65('0xc')]();markerLayer['eachLayer'](function(_0x40c5dd){const _0x46cb61=_0x4cdf65;_0x40c5dd['options'][_0x46cb61('0x54')]==undefined&&_0x40c5dd[_0x46cb61('0x28')](0.2);}),tmp_duration_list=[0x0];if(typeof _0x575ba4!==_0x4cdf65('0x3c')){var _0x1bfa2c=L[_0x4cdf65('0x52')]({'iconSize':[0x14,0x14],'iconUrl':_0x4cdf65('0x7')});_0x575ba4[_0x4cdf65('0x22')](_0x1bfa2c);}$(_0x4cdf65('0x3a'))[_0x4cdf65('0x3b')]!==0x0&&$('#tickets')[_0x4cdf65('0x4')](),$('.FixedHeightContainer')['length']!==0x0&&$('.FixedHeightContainer')[_0x4cdf65('0x4')](),tripLayer[_0x4cdf65('0x32')](function(_0x4e2a6d){const _0xe9a224=_0x4cdf65;_0x4e2a6d[_0xe9a224('0x4')]();});}var _0x575ba4=undefined,_0x47c998=undefined,_0x47ce0b=mapsPlaceholder[0x0];$(document)['on'](_0x5dc269('0x1d'),_0x5dc269('0x4d'),function(){const _0x4a1486=_0x5dc269;let _0x182d5a=buildQueryDate($(_0x4a1486('0x4d'))[_0x4a1486('0x5a')]());typeof _0x575ba4===_0x4a1486('0x3c')&&last_checked_time!==$(_0x4a1486('0x4d'))['val']()&&setTimeout(async function(){delay(0x190),await getTrainRecords(_0x182d5a);},0x190);}),$(document)['on'](_0x5dc269('0xd'),_0x5dc269('0x27'),function(){const _0x112d16=_0x5dc269;if($(_0x112d16('0x33'))['val']()!=_0x112d16('0x18')){let _0x2ebd44=$(_0x112d16('0x33'))['val']()[_0x112d16('0x8')](0x0)[_0x112d16('0x2c')]()+$('#destination_select')[_0x112d16('0x5a')]()[_0x112d16('0x57')](0x1),_0x5cc9e5=$(_0x112d16('0x55'))[_0x112d16('0x39')](_0x112d16('0x42')+_0x2ebd44+'\x27]');if(_0x5cc9e5!=null&&_0x5cc9e5[_0x112d16('0x3b')]>0x0){$(_0x112d16('0x4f'))[_0x112d16('0x53')]({'display':_0x112d16('0x2f')}),$(_0x112d16('0x33'))[_0x112d16('0xf')]();const _0x1edda1=async()=>{const _0x143246=_0x112d16;if(last_checked_time!=$(_0x143246('0x4d'))[_0x143246('0x5a')]()){let _0x4f301a=buildQueryDate($(_0x143246('0x4d'))['val']());setTimeout(async function(){const _0x3a1b46=_0x143246;delay(0x190),await getTrainRecords(_0x4f301a);let _0x14aac1=$(_0x3a1b46('0x51')+_0x2ebd44+'\x22]')[_0x3a1b46('0x4b')](_0x3a1b46('0x30')),_0x46114c=![];typeof _0x575ba4!==_0x3a1b46('0x3c')&&(tripLayer[_0x3a1b46('0x32')](function(_0x393a41){const _0x57deed=_0x3a1b46;_0x393a41[_0x57deed('0x4')]();}),markerLayer['eachLayer'](function(_0x5dce6b){const _0x36e247=_0x3a1b46;_0x5dce6b[_0x36e247('0x28')](0.2);})),markerLayer[_0x3a1b46('0x32')](function(_0x41630a){const _0xfab380=_0x3a1b46;_0x14aac1==_0x41630a[_0xfab380('0x13')]['id']&&_0x46114c==![]&&(_0x9a1689(_0x41630a),_0x46114c=!![]);});},0x3e8);}else{let _0x85fca1=$(_0x143246('0x51')+_0x2ebd44+'\x22]')[_0x143246('0x4b')]('value'),_0x28ad9f=![];typeof _0x575ba4!==_0x143246('0x3c')&&(tripLayer[_0x143246('0x32')](function(_0x3ee448){const _0xffb8de=_0x143246;_0x3ee448[_0xffb8de('0x4')]();}),markerLayer['eachLayer'](function(_0x1a4af5){const _0x56477f=_0x143246;_0x1a4af5[_0x56477f('0x28')](0.2);})),markerLayer[_0x143246('0x32')](function(_0x55e1d0){const _0x343e61=_0x143246;_0x85fca1==_0x55e1d0[_0x343e61('0x13')]['id']&&_0x28ad9f==![]&&(_0x9a1689(_0x55e1d0),_0x28ad9f=!![]);});}};setTimeout(function(){_0x1edda1();},0x64);}}else alert(_0x112d16('0x12'));});function _0x9a1689(_0x2d9b65){const _0x1c3f6d=_0x5dc269;let _0x493584=!![];_0x40c4bb(),_0x2d9b65[_0x1c3f6d('0x28')](0x1),_0x575ba4=_0x2d9b65,last_checked_departure=_0x2d9b65[_0x1c3f6d('0x13')]['id'];let _0x23303f=new Date();if(_0x493584){_0x2d9b65['closePopup'](),_0x2d9b65['setIcon'](L[_0x1c3f6d('0x52')]({'iconSize':[0x19,0x19],'iconUrl':_0x1c3f6d('0x0')}));let _0x31e513=buildQueryDate($(_0x1c3f6d('0x4d'))[_0x1c3f6d('0x5a')]()),_0x200dc0=_0x2d9b65,_0x2fdb08=$('input[name=\x27weather\x27]:checked')[_0x1c3f6d('0x58')]('id'),_0xd3bd89=$(_0x1c3f6d('0x29'))[_0x1c3f6d('0x58')]('id'),_0xe71f19=$('input[name=\x27trip_type\x27]:checked')['attr']('id'),_0x41bc59=$(_0x1c3f6d('0x21'))[_0x1c3f6d('0x58')]('id');displayTickets(_0x47ce0b);if(_0x41bc59==_0x1c3f6d('0x3'))console['log'](_0x1c3f6d('0x37')),getCityConnections(_0x31e513,_0x200dc0,_0xe71f19,_0xd3bd89);else{if(_0x41bc59==_0x1c3f6d('0x3e')){let _0xac9b3=$(_0x1c3f6d('0x47'))[_0x1c3f6d('0x58')]('id');getRoundTrip(_0x200dc0,_0xe71f19,_0xd3bd89,_0xac9b3);}else{let _0x5174d7=buildQueryDate($(_0x1c3f6d('0x19'))[_0x1c3f6d('0x5a')]());getRoundTrip(_0x200dc0,_0xe71f19,_0xd3bd89,_0x5174d7);}}}}function _0x4ce719(_0x3ef430){const _0x54a451=_0x5dc269;console[_0x54a451('0x40')](_0x54a451('0x44')),$(_0x54a451('0x4f'))[_0x54a451('0x53')]({'display':_0x54a451('0x2f')});const _0x36c5f1=async()=>{const _0x160948=_0x54a451;_0x40c4bb(),_0x3ef430[_0x160948('0x49')][_0x160948('0x28')](0x1),_0x575ba4=_0x3ef430[_0x160948('0x49')],last_checked_departure=_0x3ef430[_0x160948('0x49')]['options']['id'];let _0x26d1e5=new Date();_0x3ef430[_0x160948('0x31')][_0x160948('0xa')](),_0x3ef430[_0x160948('0x49')]['setIcon'](L[_0x160948('0x52')]({'iconSize':[0x19,0x19],'iconUrl':_0x160948('0x0')}));let _0x55bc01=buildQueryDate($(_0x160948('0x4d'))[_0x160948('0x5a')]()),_0x14e523=_0x3ef430[_0x160948('0x49')],_0x5904d6=$('input[name=\x27trip\x27]:checked')[_0x160948('0x58')]('id'),_0x409db3=$(_0x160948('0x2a'))[_0x160948('0x58')]('id'),_0x4d2da1=$(_0x160948('0x21'))[_0x160948('0x58')]('id');displayTickets(_0x47ce0b);var _0x2e1556=0x0;if(_0x4d2da1===_0x160948('0x3'))console[_0x160948('0x40')](_0x160948('0x37')),getCityConnections(_0x55bc01,_0x14e523,_0x409db3,_0x5904d6);else{if(_0x4d2da1===_0x160948('0x3e')){let _0xb260df=$(_0x160948('0x47'))['attr']('id');getRoundTrip(_0x14e523,_0x409db3,_0x5904d6,_0xb260df);}else{let _0x742e27=buildQueryDate($(_0x160948('0x19'))[_0x160948('0x5a')]());getRoundTrip(_0x14e523,_0x409db3,_0x5904d6,_0x742e27);}}_0x3ef430[_0x160948('0x17')]!==undefined&&(_0x47c998=!![],$(_0x160948('0x33'))[_0x160948('0x5a')](_0x3ef430[_0x160948('0x49')][_0x160948('0x13')]['city'])[_0x160948('0x1d')]());};setTimeout(function(){_0x36c5f1();},0x64);}function _0x3df626(_0x35d349){const _0x20d094=_0x5dc269;if($('#'+_0x35d349['sourceTarget']['options']['id'])['length']>0x0){var _0x3c0d02=document[_0x20d094('0x11')](_0x35d349[_0x20d094('0x49')]['options']['id']);_0x3c0d02[_0x20d094('0x20')]();}else console[_0x20d094('0x40')](_0x20d094('0x5b'));}function _0x546aef(_0x2e3018,_0x158c09){const _0x3c12cc=_0x5dc269;if(_0x158c09['length']>0x1){let _0x7fb165=L[_0x3c12cc('0x2')]();_0x158c09[_0x3c12cc('0x1c')](function(_0x1305ff){const _0xcf227=_0x3c12cc;var _0x48b07c=L[_0xcf227('0x3d')]([_0x1305ff[_0xcf227('0x41')],_0x1305ff['lon']],{'id':_0x2e3018,'city':_0x1305ff[_0xcf227('0x5')],'iata':_0x1305ff[_0xcf227('0x14')]})['on'](_0xcf227('0x4a'),_0x4ce719)['on'](_0xcf227('0xd'),_0x3df626)['setOpacity'](0.6)[_0xcf227('0x23')](_0x1305ff[_0xcf227('0x5')],{'permanent':![],'direction':_0xcf227('0x9')});_0x48b07c['on']({'click':function(){const _0x489eda=_0xcf227;this[_0x489eda('0x1e')]();}}),_0x7fb165[_0xcf227('0x1')](_0x48b07c);});var _0x891918=L['marker']([_0x7fb165['getBounds']()['getCenter']()['lat'],_0x7fb165['getBounds']()[_0x3c12cc('0x6')]()[_0x3c12cc('0x59')]],{'id':_0x2e3018,'city':_0x158c09[0x0][_0x3c12cc('0x5')]})['on'](_0x3c12cc('0x4a'),_0x4ce719)['on'](_0x3c12cc('0xd'),_0x3df626)['setOpacity'](0.6)[_0x3c12cc('0x23')](_0x158c09[0x0][_0x3c12cc('0x5')],{'permanent':![],'direction':_0x3c12cc('0x9')});if(L[_0x3c12cc('0x4c')]['mobile']){var _0x188ee2=L['icon']({'iconSize':[0xa,0xa],'iconAnchor':[0xf,0xf],'iconUrl':_0x3c12cc('0x7')});_0x891918['setIcon'](_0x188ee2);}else{var _0x188ee2=L[_0x3c12cc('0x52')]({'iconSize':[0x14,0x14],'iconAnchor':[0xa,0xa],'iconUrl':_0x3c12cc('0x7')});_0x891918[_0x3c12cc('0x22')](_0x188ee2);}markerLayer[_0x3c12cc('0x1')](_0x891918);}else _0x158c09[_0x3c12cc('0x1c')](function(_0x2d5f2e){const _0x54d07a=_0x3c12cc;var _0x508711=L['marker']([_0x2d5f2e[_0x54d07a('0x41')],_0x2d5f2e[_0x54d07a('0x48')]],{'id':_0x2e3018,'city':_0x2d5f2e[_0x54d07a('0x5')],'iata':_0x2d5f2e[_0x54d07a('0x14')]})['on']('dblclick',_0x4ce719)['on'](_0x54d07a('0xd'),_0x3df626)[_0x54d07a('0x28')](0.6)[_0x54d07a('0x23')](_0x2d5f2e[_0x54d07a('0x5')],{'permanent':![],'direction':_0x54d07a('0x9')});_0x508711['on']({'click':function(){const _0x456268=_0x54d07a;this[_0x456268('0x1e')]();}});if(L[_0x54d07a('0x4c')]['mobile']){var _0x9f369e=L[_0x54d07a('0x52')]({'iconSize':[0xa,0xa],'iconAnchor':[0xf,0xf],'iconUrl':_0x54d07a('0x7')});_0x508711[_0x54d07a('0x22')](_0x9f369e);}else{var _0x9f369e=L['icon']({'iconSize':[0x14,0x14],'iconAnchor':[0xa,0xa],'iconUrl':_0x54d07a('0x7')});_0x508711[_0x54d07a('0x22')](_0x9f369e);}markerLayer[_0x54d07a('0x1')](_0x508711);});}let _0x28f5dd=0x0;station['forEach'](function(_0x163d13){_0x546aef(_0x28f5dd,_0x163d13),_0x28f5dd=_0x28f5dd+0x1;}),_0x47ce0b[_0x5dc269('0xb')](markerLayer[_0x5dc269('0x34')]());});