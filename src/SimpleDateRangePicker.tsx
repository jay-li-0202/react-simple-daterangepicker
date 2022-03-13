import { Button, Paper, TextField } from '@mui/material';
import { Component } from 'react';
import InputMask from "react-input-mask";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import React from 'react';
import { format, parse, isValid } from 'date-fns';

export enum DaySelectionRangeOptions {
    ExtendToAfterTwoClicks = 0,
    ResetFromAterTwoClicks = 1
}

export interface SimpleDateRangeColors {
    dayInsideRangeSelected: string;
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
}

export default class SimpleDateRangePicker extends Component<SimpleDateRangePickerProps, SimpleDateRangePickerState> {

    state: SimpleDateRangePickerState;
    mousedownCallback: (e: MouseEvent) => void;

    constructor(props: SimpleDateRangePickerProps) {
        super(props);
        let now = new Date();
        this.state = {
            fromDateValue: '',
            toDateValue: '',
            currentCalendarDate: new Date(), // start with today
            nextCalendarDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            showCalendar: false,
            calendarRef: React.createRef(),
            fromDate: undefined,
            toDate: undefined
        };

        this.mousedownCallback = (e) => { this.handleOutsideClick(e) };
        document.addEventListener('mousedown', this.mousedownCallback);
    }

    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.mousedownCallback);
    }

    handleOutsideClick(e: MouseEvent): void {
        let clickedOutsideCalendar = this.state.calendarRef && !this.state.calendarRef.current.contains(e.target);

        this.setState({
            showCalendar: clickedOutsideCalendar ? false : !clickedOutsideCalendar ? true : !this.state.showCalendar
        });
    }

    onChangeFrom(e: React.ChangeEvent<HTMLInputElement>): void {
        const { onChangeFrom } = this.props;

        let fromDate = new Date(e.target.value);

        if (this.state.toDate !== undefined) {
            if (fromDate > this.state.toDate) {
                return; // do nothing
            }
        }

        if (onChangeFrom && isValid(parse(e.target.value, 'MM/dd/yyyy', new Date()))) {
            onChangeFrom(new Date(e.target.value));
        }

        this.setState({
            fromDate: new Date(e.target.value),
            fromDateValue: e.target.value
        });
    }

    onChangeTo(e: React.ChangeEvent<HTMLInputElement>): void {
        const { onChangeTo } = this.props;
        if (onChangeTo && isValid(parse(e.target.value, 'MM/dd/yyyy', new Date()))) {
            onChangeTo(new Date(e.target.value));
        }

        let toDate = new Date(e.target.value);

        if (this.state.fromDate !== undefined) {
            if (toDate < this.state.fromDate) {
                return; // do nothing
            }
        }

        this.setState({
            toDate: new Date(e.target.value),
            toDateValue: e.target.value
        });
    }

    calendarNavigateBack(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {

        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() - 1)),
            nextCalendarDate: new Date(this.state.nextCalendarDate.setMonth(this.state.nextCalendarDate.getMonth() - 1))
        });
    }

    calendarNavigateNext(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.setState({
            currentCalendarDate: new Date(this.state.currentCalendarDate.setMonth(this.state.currentCalendarDate.getMonth() + 1)),
            nextCalendarDate: new Date(this.state.nextCalendarDate.setMonth(this.state.nextCalendarDate.getMonth() + 1)),
        });
    }

    getCalendarDateDaysInMonth(date: Date): number {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    dayClicked(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, day: number, date: Date): void {

        let newDate = new Date(date);
        newDate.setDate(day);

        // both dates are defined, check if we're extending the to date or setting the from date
        if (this.state.fromDate !== undefined && this.state.toDate !== undefined) {

            if (newDate > this.state.toDate && this.props.daySelectionRangeOptions == DaySelectionRangeOptions.ExtendToAfterTwoClicks) {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeTo } = this.props;
                if (onChangeTo) {
                    onChangeTo(newDate);
                }
            }
            else {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy'),
                    toDate: undefined,
                    toDateValue: ''
                });
                const { onChangeFrom } = this.props;
                if (onChangeFrom) {
                    onChangeFrom(newDate);
                }
                const { onChangeTo } = this.props;
                if (onChangeTo) {
                    onChangeTo(undefined);
                }
            }
        }
        else {

            // the from date isn't set, start with that
            if (this.state.fromDate === undefined) {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeFrom } = this.props;
                if (onChangeFrom) {
                    onChangeFrom(newDate);
                }
            }
            else if (this.state.fromDate?.getDate() < day) {
                this.setState({
                    toDate: newDate,
                    toDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeTo } = this.props;
                if (onChangeTo) {
                    onChangeTo(newDate);
                }
            }
            // otherwise set the from date again
            else {
                this.setState({
                    fromDate: newDate,
                    fromDateValue: format(newDate, 'MM/dd/yyyy')
                });
                const { onChangeFrom } = this.props;
                if (onChangeFrom) {
                    onChangeFrom(newDate);
                }
            }
        }
    }

    getWeeks(date: Date): Array<number[]> {
        let weeks: Array<number[]> = [];

        date = new Date(date);

        let daysInMonth = this.getCalendarDateDaysInMonth(date);
        let firstWeek = [];
        date.setDate(1);
        let dayOfWeek = date.getDay();

        if (dayOfWeek !== 0) {
            for (var i = dayOfWeek; i > 0; i--) {
                date.setDate(date.getDate() - 1);
                firstWeek.push(date.getDate());
            }
        }

        firstWeek = firstWeek.reverse();

        if (dayOfWeek !== 0) {
            // fill in the remainder
            for (var i = 1; i <= 7 - dayOfWeek; i++) {
                firstWeek.push(i);
            }
        }

        weeks.push(firstWeek);

        let initial = dayOfWeek == 0 ? 7 : dayOfWeek;

        for (var i = 14 - initial; i < daysInMonth; i += 7) {

            let r = [];
            for (var j = i; j > i - 7; j--) {
                r.push(j);
            }

            weeks.push(r.reverse());
        }

        let lastWeek = weeks[weeks.length - 1];

        // get the remainder
        if (lastWeek[lastWeek.length - 1] !== daysInMonth) {
            let finalWeek = [];
            for (var i = lastWeek[lastWeek.length - 1] + 1; i <= daysInMonth; i++) {
                finalWeek.push(i);
            }

            weeks.push(finalWeek);
        }

        return weeks;
    }

    render() {

        let currentCalendarWeeks = this.getWeeks(this.state.currentCalendarDate);
        let nextCalendarWeeks = this.getWeeks(this.state.nextCalendarDate);

        let weekDayNames = [
            'Su',
            'Mo',
            'Tu',
            'We',
            'Th',
            'Fr',
            'Sa'
        ];

        return (
            <div ref={this.state.calendarRef} style={{ width: '500px' }}>
                <InputMask mask="99/99/9999" onChange={(e) => this.onChangeFrom(e)} value={this.state.fromDateValue}>
                    {() => <TextField id="outlined-basic" label="From" variant="outlined" />}
                </InputMask>
                <InputMask mask="99/99/9999" onChange={(e) => this.onChangeTo(e)} value={this.state.toDateValue}>
                    {() => <TextField id="outlined-basic" label="To" variant="outlined" />}
                </InputMask>

                <Paper style={{ padding: '24px', width: '600px', textAlign: 'center', display: this.state.showCalendar ? 'block' : 'none', position: 'relative' }}>
                    <div style={{ width: '100%', position: 'relative', display: 'flex' }}>
                        <Button onClick={(e) => { this.calendarNavigateBack(e) }} style={{ display: 'inline-block', marginLeft: '0' }}>
                            <NavigateBeforeIcon style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} />
                        </Button>
                        <span style={{ fontWeight: '700', display: 'inline-block', flex: '25%', paddingTop: '6px', textAlign: 'center' }}>
                            {this.state.currentCalendarDate.toLocaleString('default', { month: 'long' })} {this.state.currentCalendarDate.toLocaleString('default', { year: 'numeric' })}
                        </span>
                        <Button style={{ display: 'inline-block', margin: '0 auto' }} onClick={() => {
                            let now = new Date();
                            this.setState({
                                currentCalendarDate: new Date(),
                                nextCalendarDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                            });
                        }}>
                            Today
                        </Button>
                        <span style={{ fontWeight: '700', display: 'inline-block', flex: '25%', paddingTop: '6px', marginRight: '0', textAlign: 'center'}}>
                            {this.state.nextCalendarDate.toLocaleString('default', { month: 'long' })} {this.state.nextCalendarDate.toLocaleString('default', { year: 'numeric' })}
                        </span>
                        <Button onClick={(e) => { this.calendarNavigateNext(e) }} style={{ display: 'inline-block', marginRight: '0'}}>
                            <NavigateNextIcon style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} />
                        </Button>
                    </div>

                    {/*Current Calendar*/}
                    <div style={{ display: 'inline-block', padding: '12px', verticalAlign: 'top' }}>
                        <div style={{ display: 'block' }}>
                        {
                            weekDayNames.map(name => {
                                return (
                                    <Paper key={name} sx={{ borderColor: 'white' }} variant="outlined" style={{ display: 'inline-block', width: '36px', height: '36px', textAlign: 'center', color: '#999' }}>{name}</Paper>
                                );
                            })
                        }
                        </div>
                        <div style={{ display: 'inline-block' }}>
                            {
                                currentCalendarWeeks.map((week, index) => {
                                    return (
                                        <div key={index} style={{ display: 'block', textAlign: 'left' }}>
                                            {
                                                week.map(day => {
                                                    let date = new Date(this.state.currentCalendarDate);
                                                    date.setDate(day);

                                                    let insideAvailability = date >= this.props.availabilityDateRange[0] && date <= this.props.availabilityDateRange[1];

                                                    let doesntStartSunday = index == 0 && week[0] > 10 && day > 10;
                                                    let dateFormatted = date ? format(date, 'MM/dd/yyyy') : undefined;

                                                    let fromDateFormatted = this.state.fromDate && isValid(this.state.fromDate) ? format(this.state.fromDate, 'MM/dd/yyyy') : undefined;
                                                    let toDateFormatted = this.state.toDate && isValid(this.state.toDate) ? format(this.state.toDate, 'MM/dd/yyyy') : undefined;

                                                    return <Button disabled={!insideAvailability} key={day} onClick={(e) => { this.dayClicked(e, day, this.state.currentCalendarDate) }} variant="outlined" style={{
                                                        color: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayTextColor : this.props.simpleDateRangeColors.dayTextColor,
                                                        borderColor: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayBorderColor : this.props.simpleDateRangeColors.dayBorderColor,
                                                        backgroundColor: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayBackgroundColor : dateFormatted == fromDateFormatted || dateFormatted == toDateFormatted ? this.props.simpleDateRangeColors.fromToDaySelected :
                                                            this.state.fromDate && this.state.toDate && date > this.state.fromDate && date < this.state.toDate ? this.props.simpleDateRangeColors.dayInsideRangeSelected : this.props.simpleDateRangeColors.dayNotSelected,
                                                        display: 'inline-block', padding: '0px', maxWidth: '36px', maxHeight: '36px', minWidth: '36px', minHeight: '36px', textAlign: 'center', visibility: doesntStartSunday ? "hidden" : "visible"
                                                    }}>{day}</Button>
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    {/*Next Calendar*/}
                    <div style={{ display: 'inline-block', padding: '12px', verticalAlign: 'top' }}>
                        <div style={{ display: 'block' }}>
                        {
                            weekDayNames.map(name => {
                                return (
                                    <Paper key={name} sx={{ borderColor: 'white' }} variant="outlined" style={{ display: 'inline-block', width: '36px', height: '36px', textAlign: 'center', color: '#999' }}>{name}</Paper>
                                );
                            })
                        }
                    </div>
                    <div style={{ display: 'inline-block' }}>
                        {
                                nextCalendarWeeks.map((week, index) => {
                                return (
                                    <div key={index} style={{ display: 'block', textAlign: 'left' }}>
                                        {
                                            week.map(day => {
                                                let date = new Date(this.state.nextCalendarDate);
                                                date.setDate(day);

                                                let doesntStartSunday = index == 0 && week[0] > 10 && day > 10;
                                                let insideAvailability = date >= this.props.availabilityDateRange[0] && date <= this.props.availabilityDateRange[1];

                                                let dateFormatted = date ? format(date, 'MM/dd/yyyy') : undefined;

                                                let fromDateFormatted = this.state.fromDate && isValid(this.state.fromDate) ? format(this.state.fromDate, 'MM/dd/yyyy') : undefined;
                                                let toDateFormatted = this.state.toDate && isValid(this.state.toDate) ? format(this.state.toDate, 'MM/dd/yyyy') : undefined;

                                                return <Button disabled={!insideAvailability} key={day} onClick={(e) => { this.dayClicked(e, day, this.state.nextCalendarDate) }} variant="outlined" style={{
                                                    color: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayTextColor : this.props.simpleDateRangeColors.dayTextColor,
                                                    borderColor: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayBorderColor : this.props.simpleDateRangeColors.dayBorderColor,
                                                    backgroundColor: !insideAvailability ? this.props.simpleDateRangeColors.disabledDayBackgroundColor : dateFormatted == fromDateFormatted || dateFormatted == toDateFormatted ? this.props.simpleDateRangeColors.fromToDaySelected :
                                                        this.state.fromDate && this.state.toDate && date > this.state.fromDate && date < this.state.toDate ? this.props.simpleDateRangeColors.dayInsideRangeSelected : this.props.simpleDateRangeColors.dayNotSelected,
                                                    display: 'inline-block', padding: '0px', maxWidth: '36px', maxHeight: '36px', minWidth: '36px', minHeight: '36px', textAlign: 'center', visibility: doesntStartSunday ? "hidden" : "visible"
                                                }}>{day}</Button>
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    </div>
                </Paper>
            </div>
        );
    }
}