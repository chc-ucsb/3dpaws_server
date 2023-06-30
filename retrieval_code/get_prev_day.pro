function get_prev_day, year=year, month=month, day=day, today=today, just_day=just_day
  ;
  ; this is a function that is designed to return a 3-element array of the year month day
  ; 
  ; inputs:
  ;   year: the year of the input day
  ;   month: the month of the input day
  ;   days: the day after the desired day
  ; keywords:
  ;   today: returns the previous day of the day the function is being run
  ;   just_day: returns just the previous day, and not the year, month  
  ;  
  ; outputs:
  ;   day_array: a three elements array of the year,month, day before the input day;
  ; 
  ; written by Robert Saldivar 2021/10/4
  ;
  ;-----------------------------------------------------------------------------------
  
  ; if the year,month,day are input then being
  if (n_elements(year) eq 1 and n_elements(month) eq 1 and n_elements(day) eq 1) then begin
    
    jul_day = julday(month, day, year)
    prev_jul_day = jul_day-1
    caldat, prev_jul_day, prev_month, prev_day, prev_year
    
  endif
  
  ; if keyword today set then  begin 
  if (keyword_set(today)) then begin
    
    jul_today = julday()
    jul_yesterday = jul_today-1
    caldat, jul_yesterday, prev_month, prev_day, prev_year
    
  endif
  
  ; sets day_array
  day_array = [prev_year,prev_month,prev_day]
  if (keyword_set(just_day)) then day_array = [prev_day]
  
  ; returns day_array
  return, day_array
  
end
  
  
