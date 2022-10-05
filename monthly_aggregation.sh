#!/bin/bash
psql -U $POSTGRES_USER -d $POSTGRES_DB << EOF
  insert into monthly_aggregation (
    management_id,
    aggregate_num,
    aggregate_date
  )
  select id, current_num, date(DATE_TRUNC('month', now()) + '-1 Day')
  from management_data;
EOF
exit $?
