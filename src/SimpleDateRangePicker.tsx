import { Button, Paper, TextField } from '@mui/material';
import { Component } from 'react';
import InputMask from "react-input-mask";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React from 'react';
import { format, isValid } from 'date-fns';

// each option produces different behavior when selecting a range
export enum DaySelectionRangeOptions {
    ExtendToAfterTwoClicks = 0, // after the second click, if the selected date is later than the current to date, extend the range by setting the to date to the selected date
    ResetFromAterTwoClicks = 1, // after the second click, reset the range and set the from date to the selected date
    BidirectionalResetFromAfterTwoClicks = 2 // by default the range is from -> to, this allows it to be to -> from
}

// these are the colors for the date range picker
export interface SimpleDateRangeColors {
    dayInsideRangeSelected: string;
    dayInsideRangeHighlight: string;
    fromToDaySelected: string;
    dayNotSelected: string;
    dayTextColor: string;
    dayBorderColor: string;
    disabledDayTextColor: string;
    disabledDayBorderColor: string;
    disabledDayBackgroundColor: string;
}

export interface SimpleDateRangePickerProps {
    onChangeFrom: (date: Date | undefined) => void;
    onChangeTo: (date: Date | undefined) => void;
    daySelectionRangeOptions: DaySelectionRangeOptions;
    availabilityDateRange: Date[];
    simpleDateRangeColors: SimpleDateRangeColors;
}

export interface SimpleDateRangePickerState {
    fromDate: Date | undefined;
    toDate: Date | undefined;
    fromDateValue: string;
    toDateValue: string;
    currentCalendarDate: Date;
    nextCalendarDate: Date;
    showCalendar: boolean;
    calendarRef: React.RefObject<any>;
    hoveredToDate?: Date | undefined;
}

export default class SimpleDateRangePicker extends Component<SimpleDateRangePickerProps, SimpleDateRangePickerState> {

    state: SimpleDateRangePickerState;
    mousedownCallback: (e: MouseEvent) => void;

    // get the weekday names for the header values in the calendars
    private weekDayNames = [
        'Su',
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa'
    ];

    constructor(props: SimpleDateRangePickerProps) {
        super(props);
        const now = new Date();

        this.state = {
            fromDateValue: '',
            toDateValue: '',
            currentCalendarDate: now, // start with today
            nextCalendarDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            showCalendar: false,
            calendarRef: React.createRef(),
            fromDate: undefined,
            toDate: undefined,
            hoveredToDate: undefined,
        };

        this.mousedownCallback = (e) => { this.handleOutsideClick(e) };
        document.addEventListener('mousedown', this.mousedownCallback);
    }

    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.mousedownCallback);
    }

    // check if we clicked outside the calendar panel, and if so close it
    handleOutsideClick(e: MouseEvent): void {
        let clickedOutsideCalendar = this.state.calendarRef && !this.state.calendarRef.current.contains(e.target);

        this.setState({
            showCalendar: clickedOutsideCalendar ? false : !clickedOutsideCalendar ? true : !this.state.showCalendar
        });
    }

    calendarNavigate(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, amountOfMonths: number): void {

        // navigate forward one month
        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() + amountOfMonths)),
            nextCalendarDate: new Date(this.state.nextCalendarDate.setMonth(this.state.nextCalendarDate.getMonth() + amountOfMonths)),
        });
    }

    dayClicked(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, day: number, newDate: Date): void {
        // both dates are defined, check if we're extending the to date or setting the from date
        if (this.state.fromDate !== undefined && this.state.toDate !== undefined) {

            // extending the to date
            if (newDate > this.state.toDate && this.props.daySelectionRangeOptions === DaySelectionRangeOptions.ExtendToAfterTwoClicks) {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
                this.props.onChangeTo(newDate);
            }
            // setting the from date
            else {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy'),
                    toDate: undefined,
                    toDateValue: ''
                });
                this.props.onChangeFrom(newDate);
                this.props.onChangeTo(undefined);
            }
        }
        // the from date isn't set, start with that
        else if (this.state.fromDate === undefined) {
            this.setState({
                fromDate: newDate,
                fromDateValue: format(newDate, 'MM/dd/yyyy')
            });
            this.props.onChangeFrom(newDate);
        }
        // if it is, and the new date is before it and we're bidirectional two click reset, swap from and to 
        else if (this.state.fromDate > newDate && this.props.daySelectionRangeOptions === DaySelectionRangeOptions.BidirectionalResetFromAfterTwoClicks) {
            var d = new Date(this.state.fromDate);
            this.setState({
                toDate: d,
                toDateValue: format(d, 'MM/dd/yyyy'),
                fromDate: newDate,
                fromDateValue: format(newDate, 'MM/dd/yyyy')
            });

            this.props.onChangeFrom(newDate);
            this.props.onChangeTo(d);
        }
        // otherwise if the from date is before the selected date, set it as the to date
        else if (this.state.fromDate < newDate) {
            this.setState({
                toDate: newDate,
                toDateValue: format(newDate, 'MM/dd/yyyy')
            });
            this.props.onChangeTo(newDate);
        }
        // otherwise set the from date again
        else {
            this.setState({
                fromDate: newDate,
                fromDateValue: format(newDate, 'MM/dd/yyyy')
            });
            this.props.onChangeFrom(newDate);
        }
    }

    calendarDateOnMouseOver(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, day: number, date: Date): void {

        // on calendar date over, set the hovered to date
        this.setState({
            hoveredToDate: date
        });
    }

    getWeeks(date: Date): Array<number[]> {
        let weeks: Array<number[]> = [];

        // create a new date off of the current and next calendar dates so when we navigate the months the calendars update correctly
        date = new Date(date);

        // get calendar date days in month
        let daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        // build the first week
        let firstWeek = [];

        // start on the first of the month
        date.setDate(1);

        // get the day of week
        let dayOfWeek = date.getDay();

        // we need to check for sunday, since if it's not, we need a partial first week, otherwise the week will be build after

        // 0 is sunday, if it's not
        if (dayOfWeek !== 0) {

            // iterate backwards and generate the week
            for (let i = dayOfWeek; i > 0; i--) {
                date.setDate(date.getDate() - 1);
                firstWeek.push(date.getDate());
            }

            // invert it to get the right week
            firstWeek = firstWeek.reverse();

            // fill in the remainder
            for (let i = 1; i <= 7 - dayOfWeek; i++) {
                firstWeek.push(i);
            }

            // add the partial first week
            weeks.push(firstWeek);
        }

        // if the months 1st is a sunday, set the initial to 7 to account for a week
        let initial = dayOfWeek === 0 ? 7 : dayOfWeek;

        // get the middle bulk of the month, leaving out the last week in case it's partial, iterating through each week
        for (var i = 14 - initial; i < daysInMonth; i += 7) {

            let r = [];
            for (var j = i; j > i - 7; j--) {
                r.push(j);
            }

            weeks.push(r.reverse());
        }

        let lastWeek = weeks[weeks.length - 1];

        // get the remainder if the last day is less than the amount of days in the month
        if (lastWeek[lastWeek.length - 1] < daysInMonth) {
            let finalWeek = [];

            // start from the first day of the last week, generating the rest of the days
            for (let i = lastWeek[lastWeek.length - 1] + 1; i <= daysInMonth; i++) {
                finalWeek.push(i);
            }

            // add the final week
            weeks.push(finalWeek);
        }

        return weeks;
    }

    // get a calendar for the date range picker
    getCalendar(weeks: number[][], calendarDate: Date): unknown {
        return (
            <div style={{ display: 'inline-block', padding: '12px', verticalAlign: 'top' }}>
                {/* output the weekday headers */}
                <div style={{ display: 'block' }}>
                    {
                        this.weekDayNames.map(name => {
                            return (
                                <Paper key={name} sx={{ borderColor: 'white' }} variant="outlined" style={{ display: 'inline-block', width: '36px', height: '36px', textAlign: 'center', color: '#999' }}>{name}</Paper>
                            );
                        })
                    }
                </div>
                {/* output the weeks */}
                <div style={{ display: 'inline-block' }}>
                    {
                        // for each week
                        weeks.map((week, index) => {
                            return (
                                <div key={index} style={{ display: 'block', textAlign: 'left' }}>
                                    {
                                        // for each day of the week
                                        week.map(day => {

                                            // determine the background color using the props color options
                                            let getBackgroundColor = (): string => {

                                                // zero out the time for the hovered to date
                                                this.state.hoveredToDate?.setHours(0, 0, 0, 0);

                                                // if we're not inside the available dates, disable the day
                                                if (!insideAvailability) {
                                                    return this.props.simpleDateRangeColors.disabledDayBackgroundColor;
                                                }
                                                // if the date matches the from or to, use that color
                                                else if (dateFormatted === fromDateFormatted || dateFormatted === toDateFormatted) {
                                                    return this.props.simpleDateRangeColors.fromToDaySelected;
                                                }
                                                // if the date is inside the range, use that color
                                                else if (this.state.fromDate && this.state.toDate && date > this.state.fromDate && date < this.state.toDate) {
                                                    return this.props.simpleDateRangeColors.dayInsideRangeSelected;
                                                }
                                                // if we have a from date, and we don't have a to date, or we do have a to date and the extend
                                                // to after two clicks option is selected, and there's a hovered to date, and the date is
                                                // within the hovered range forward, or within range backwards if the bidirectional reset from after two clicks
                                                // is selected, use the range highlight color
                                                else if (this.state.fromDate
                                                    && (!this.state.toDate ||
                                                        (this.state.toDate &&
                                                            this.props.daySelectionRangeOptions === DaySelectionRangeOptions.ExtendToAfterTwoClicks))
                                                    && this.state.hoveredToDate
                                                    && (
                                                        (date > this.state.fromDate && date <= this.state.hoveredToDate) ||
                                                        (date < this.state.fromDate && date >= this.state.hoveredToDate
                                                            && this.props.daySelectionRangeOptions === DaySelectionRangeOptions.BidirectionalResetFromAfterTwoClicks)
                                                    )
                                                ) {
                                                    return this.props.simpleDateRangeColors.dayInsideRangeHighlight;
                                                }
                                                // otherwise use the day not selected color for the date
                                                else {
                                                    return this.props.simpleDateRangeColors.dayNotSelected;
                                                }
                                            };

                                            // get a date from the current calendar date, set the dates day to it, and zero out the time
                                            let date = new Date(calendarDate);
                                            date.setDate(day);
                                            date.setHours(0, 0, 0, 0);

                                            // check if it's inside the available range
                                            let insideAvailability = date >= this.props.availabilityDateRange[0] && date <= this.props.availabilityDateRange[1];

                                            // whether or not it starts on sunday
                                            let doesntStartSunday = index === 0 && week[0] > 10 && day > 10;

                                            // get formatted dates for comparison
                                            let dateFormatted = date ? format(date, 'MM/dd/yyyy') : undefined;
                                            let fromDateFormatted = this.state.fromDate && isValid(this.state.fromDate) ? format(this.state.fromDate, 'MM/dd/yyyy') : undefined;
                                            let toDateFormatted = this.state.toDate && isValid(this.state.toDate) ? format(this.state.toDate, 'MM/dd/yyyy') : undefined;

                                            // use the onclick for selecting the date range, and on mouse over for
                                            // highlighting the values between
                                            return <Button disabled={!insideAvailability} key={day}
                                                onClick={(e) => { this.dayClicked(e, day, date) }}
                                                onMouseOver={(e) => { this.calendarDateOnMouseOver(e, day, date) }}
                                                variant="outlined" style={{
                                                    color: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayTextColor : this.props.simpleDateRangeColors.dayTextColor,
                                                    borderColor: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayBorderColor : this.props.simpleDateRangeColors.dayBorderColor,
                                                    backgroundColor: getBackgroundColor(),
                                                    display: 'inline-block', padding: '0px', maxWidth: '36px', maxHeight: '36px', minWidth: '36px', minHeight: '36px', textAlign: 'center', visibility: doesntStartSunday ? "hidden" : "inherit"
                                                }}>{day}</Button>
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }

    render() {

        // get the current and next calendar weeks, the days get set to the first of the month so it doesn't matter what the day is
        // but the month and year are important.
        let currentCalendarWeeks = this.getWeeks(this.state.currentCalendarDate);
        let nextCalendarWeeks = this.getWeeks(this.state.nextCalendarDate);

        // using material to draw the calendar days as buttons on a Paper component
        return (
            <div ref={this.state.calendarRef} style={{ width: '500px' }}>
                {/* Use the input masks to store the formatted versions of the date range */}
                <InputMask mask="99/99/9999" value={this.state.fromDateValue}>
                    {() => <TextField id="outlined-basic" label="From" variant="outlined" />}
                </InputMask>
                <InputMask mask="99/99/9999" value={this.state.toDateValue}>
                    {() => <TextField id="outlined-basic" label="To" variant="outlined" />}
                </InputMask>

                {/* Use a Paper component as the container for the calendars */}
                <Paper style={{ padding: '24px', width: '600px', textAlign: 'center', visibility: this.state.showCalendar ? 'visible' : 'hidden', position: 'relative' }}>
                    <div style={{ width: '100%', position: 'relative', display: 'flex' }}>
                        {/* Shift the calendars back one month */}
                        <Button onClick={(e) => { this.calendarNavigate(e, -1) }} style={{ display: 'inline-block', marginLeft: '0' }}>
                            <NavigateBeforeIcon style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} />
                        </Button>
                        <span style={{ fontWeight: '700', display: 'inline-block', flex: '25%', paddingTop: '6px', textAlign: 'center' }}>
                            {this.state.currentCalendarDate.toLocaleString('default', { month: 'long' })} {this.state.currentCalendarDate.toLocaleString('default', { year: 'numeric' })}
                        </span>
                        {/* Shift the current calendar to Todays month */}
                        <Button style={{ display: 'inline-block', margin: '0 auto' }} onClick={() => {
                            let now = new Date();
                            this.setState({
                                currentCalendarDate: new Date(),
                                nextCalendarDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                            });
                        }}>
                            Today
                        </Button>
                        <span style={{ fontWeight: '700', display: 'inline-block', flex: '25%', paddingTop: '6px', marginRight: '0', textAlign: 'center' }}>
                            {this.state.nextCalendarDate.toLocaleString('default', { month: 'long' })} {this.state.nextCalendarDate.toLocaleString('default', { year: 'numeric' })}
                        </span>
                        {/* Shift the calendars forward one month */}
                        <Button onClick={(e) => { this.calendarNavigate(e, 1) }} style={{ display: 'inline-block', marginRight: '0' }}>
                            <NavigateNextIcon style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} />
                        </Button>
                    </div>
                    {/* output the weeks */}
                    {
                        this.getCalendar(currentCalendarWeeks, this.state.currentCalendarDate)
                    }
                    {
                        this.getCalendar(nextCalendarWeeks, this.state.nextCalendarDate)
                    }
                </Paper>
            </div>
        );
    }
}