import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTravelLinks, daysBetween, holidaysWithinRange, tripInMonth, weatherDescription } from '../src/utils.js';
import { fromGeocoding } from '../src/data.js';

test('travel links use destination, airport, two adults and selected dates',()=>{
  const links=buildTravelLinks({name:'Lisbona',country:'Portogallo',lat:38.7,lng:-9.1,airport:'LIS'},'2027-04-10','2027-04-14','MXP');
  const booking=new URL(links.booking);
  assert.equal(booking.searchParams.get('ss'),'Lisbona, Portogallo');
  assert.equal(booking.searchParams.get('checkin'),'2027-04-10');
  assert.equal(booking.searchParams.get('checkout'),'2027-04-14');
  assert.equal(booking.searchParams.get('group_adults'),'2');
  assert.ok(new URL(links.flights).searchParams.get('q').includes('MXP'));
  assert.ok(links.skyscanner.includes('/mxp/lis/270410/270414/'));
});
test('Booking does not receive an invalid zero-night stay',()=>{
  const booking=new URL(buildTravelLinks({name:'Roma',country:'Italia'},'2027-04-10','2027-04-10').booking);
  assert.equal(booking.searchParams.has('checkin'),false);
  assert.equal(booking.searchParams.has('checkout'),false);
});
test('trips spanning months and years appear in every affected calendar',()=>{
  const trip={start:'2026-12-29',end:'2027-01-04'};
  assert.equal(tripInMonth(trip,2026,11),true);
  assert.equal(tripInMonth(trip,2027,0),true);
  assert.equal(tripInMonth(trip,2027,1),false);
  assert.equal(tripInMonth({start:''},2027,0),false);
});
test('holiday selection includes boundary days and excludes non-public dates',()=>{
  const holidays=[{date:'2027-01-01',types:['Public']},{date:'2027-01-02',types:['Observance']},{date:'2027-01-06',types:['Public']},{date:'2027-01-07',types:['Public']}];
  assert.deepEqual(holidaysWithinRange(holidays,'2027-01-01','2027-01-06').map(d=>d.date),['2027-01-01','2027-01-06']);
});
test('day calculations remain correct across DST boundaries',()=>{
  assert.equal(daysBetween('2027-03-27','2027-03-29'),2);
  assert.equal(daysBetween('2026-12-31','2027-01-01'),1);
});
test('world search converts real coordinates and preserves country identity',()=>{
  const d=fromGeocoding({id:123,name:'Tokyo',country:'Giappone',country_code:'jp',latitude:35.6,longitude:139.6,timezone:'Asia/Tokyo'});
  assert.equal(d.countryCode,'JP');assert.equal(d.region,'Asia');assert.equal(d.lat,35.6);assert.equal(d.custom,true);assert.equal(d.image,null);
});
test('weather codes distinguish clear, precipitation and snow',()=>{
  assert.equal(weatherDescription(0),'Sereno');assert.equal(weatherDescription(65),'Pioggia');assert.equal(weatherDescription(71),'Neve');
});
