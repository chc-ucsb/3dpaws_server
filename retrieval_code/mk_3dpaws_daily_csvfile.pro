pro mk_3dpaws_daily_csvfile, year, month, day
  ;
  ; IDL code
  ;
  ; Written by Robert Saldivar 2023/6/30 
  ;------------------------------------------------------------------------------
  
  !path = !path + ':/home/chc-source/saldivar/code/idl_functions'
  resolve_routine, ['get_prev_day'], /compile_full_file, /no_recompile, /is_function
  
  ymd = get_prev_day(year=year,month=month,day=day)
  
  outdir = string('/home/CSCD/sources/3D-PAWS/data/daily_raw/')
  raw_outfile = string(outdir,'3dpaws_rawfile.json')
  
  dayfile = string(outdir,'3dpaws_dayfile.',ymd[0],ymd[1],ymd[2],'.csv',f='(a,a,i4,".",i02,".",i02,a)')
  
  day_range = [string(ymd[0],ymd[1],ymd[2],f='(i4,"-",i02,"-",i02)'),string(year,month,day,f='(i4,"-",i02,"-",i02)')]

  ; x-api-key is removed
  curl_cmd = string('/usr/bin/curl https://ewx3.chc.ucsb.edu:3000/data -H "x-api-key: xxxxxxxxxxxxxxx" -w "\n"|  /usr/bin/jq ".data" > ', raw_outfile,f='(a,a)')
  jq_cmd = '/usr/bin/jq -r ' + "'"+'["instrumentid", "datetime", "hth"," bcs", "bpc", "cfr", "css",  "bp1", "bt1", "sh1", "st1", "ht2", "hh2", "hh1", "ht1", "mt1", "rg1", "rg2"], (.[] | select(.at>"'+day_range[0]+'") | select(.at<"'+day_range[1]+'") | [.instrument_id, .at, .hth, .bcs, .cfr, .css, .bp1, .bt1, .sh1, .st1, .ht2, .hh2, .hh1, .mt1, .rg1, .rg2]) | @csv'+"' " + raw_outfile + ' > ' + dayfile
  
  print, jq_cmd
  
  spawn, curl_cmd
  spawn, jq_cmd
  
end
